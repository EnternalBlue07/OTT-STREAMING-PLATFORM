"""Prometheus metrics collectors and an AI-cost placeholder.

Exposes HTTP request/latency/error metrics, auth-event counters, and a forward
seam (``record_ai_cost``) for tracking AI/ML spend in later phases.
"""
from __future__ import annotations

from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

# --- HTTP metrics ---
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total HTTP requests",
    labelnames=("method", "path", "status_class"),
)

HTTP_REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    labelnames=("method", "path"),
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0),
)

HTTP_ERRORS_TOTAL = Counter(
    "http_errors_total",
    "Total HTTP responses with status >= 400",
    labelnames=("method", "path", "status_class"),
)

# --- Auth metrics ---
AUTH_EVENTS_TOTAL = Counter(
    "auth_events_total",
    "Authentication events by type",
    labelnames=("event_type",),
)

# --- AI cost placeholder (forward seam) ---
AI_COST_USD_TOTAL = Counter(
    "ai_cost_usd_total",
    "Cumulative AI/ML spend in USD (placeholder for future phases)",
    labelnames=("service",),
)

AI_TOKENS_TOTAL = Counter(
    "ai_tokens_total",
    "Cumulative AI tokens consumed (placeholder for future phases)",
    labelnames=("service", "kind"),
)

BUILD_INFO = Gauge("app_build_info", "Static build info", labelnames=("app", "env"))


def status_class(status_code: int) -> str:
    return f"{status_code // 100}xx"


def record_request(method: str, path: str, status_code: int, duration_seconds: float) -> None:
    sc = status_class(status_code)
    HTTP_REQUESTS_TOTAL.labels(method, path, sc).inc()
    HTTP_REQUEST_DURATION.labels(method, path).observe(duration_seconds)
    if status_code >= 400:
        HTTP_ERRORS_TOTAL.labels(method, path, sc).inc()


def record_auth_event(event_type: str) -> None:
    AUTH_EVENTS_TOTAL.labels(event_type).inc()


def record_ai_cost(service: str, usd: float = 0.0, tokens: int = 0, kind: str = "total") -> None:
    """Placeholder API for recording AI/ML cost. Safe no-op when values are 0."""
    if usd:
        AI_COST_USD_TOTAL.labels(service).inc(usd)
    if tokens:
        AI_TOKENS_TOTAL.labels(service, kind).inc(tokens)


def render_metrics() -> tuple[bytes, str]:
    """Return (body, content_type) for the /metrics endpoint."""
    return generate_latest(), CONTENT_TYPE_LATEST
