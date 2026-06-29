"""HTTP middleware stack: request context, metrics, security headers, rate limit,
and structured request logging.

Note on ordering: Starlette applies ``add_middleware`` in reverse registration
order (last added runs first/outermost). ``main.py`` registers these so that the
request-context middleware is outermost and runs first.
"""
from __future__ import annotations

import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from infrastructure.config import get_settings
from infrastructure.cache.redis_client import get_cache
from infrastructure.observability.context import set_request_context
from infrastructure.observability.logging import log_with_extra
from infrastructure.observability.metrics import record_request
from interface.schemas import err

logger = logging.getLogger("request")

REQUEST_ID_HEADER = "X-Request-ID"
CORRELATION_ID_HEADER = "X-Correlation-ID"


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Generate/propagate request and correlation IDs and bind them to context."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex
        correlation_id = request.headers.get(CORRELATION_ID_HEADER) or request_id
        set_request_context(request_id, correlation_id)
        request.state.request_id = request_id
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        response.headers[CORRELATION_ID_HEADER] = correlation_id
        return response


class MetricsAndLoggingMiddleware(BaseHTTPMiddleware):
    """Record Prometheus metrics and emit one structured log line per request."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        # Use the route template when available to avoid high-cardinality paths.
        response = await call_next(request)
        duration = time.perf_counter() - start

        route = request.scope.get("route")
        path_label = getattr(route, "path", None) or request.url.path

        record_request(request.method, path_label, response.status_code, duration)
        log_with_extra(
            logger,
            logging.INFO,
            "http_request",
            {
                "method": request.method,
                "path": request.url.path,
                "route": path_label,
                "status": response.status_code,
                "latency_ms": round(duration * 1000, 2),
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            },
        )
        response.headers["X-Response-Time-ms"] = str(round(duration * 1000, 2))
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Apply OWASP-recommended secure response headers."""

    CSP = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["Content-Security-Policy"] = self.CSP
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if get_settings().is_production:
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Fixed-window rate limiter keyed by client IP (+ path scope)."""

    EXEMPT_PREFIXES = ("/metrics", "/api/v1/health", "/api/v1/readiness")

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if any(path.startswith(p) for p in self.EXEMPT_PREFIXES):
            return await call_next(request)

        settings = get_settings()
        cache = get_cache()
        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{client_ip}"
        count = cache.incr_with_ttl(key, settings.rate_limit_window_seconds)

        if count > settings.rate_limit_requests:
            body = err("RATE_LIMITED", "Too many requests", 429)
            resp = JSONResponse(status_code=429, content=body)
            resp.headers["Retry-After"] = str(settings.rate_limit_window_seconds)
            return resp

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, settings.rate_limit_requests - count))
        return response
