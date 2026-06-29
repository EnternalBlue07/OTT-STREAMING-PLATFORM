"""FastAPI application entrypoint.

Wires configuration, observability, middleware, error handling, routing, and the
Prometheus metrics endpoint. Run with:

    uvicorn main:app --reload --port 8001
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from infrastructure.config import get_settings
from infrastructure.content.seed import seed_if_empty
from infrastructure.content.seed_phase2 import backfill_and_seed
from infrastructure.database import models as _models  # noqa: F401  (register ORM tables)
from infrastructure.database.migrations import ensure_content_columns
from infrastructure.database.session import SessionLocal, engine, init_db
from infrastructure.observability.logging import configure_logging, get_logger
from infrastructure.observability.metrics import BUILD_INFO, render_metrics
from infrastructure.observability.sentry import init_sentry
from infrastructure.observability.tracing import init_tracing, instrument_fastapi
from interface.api.router import api_router
from interface.error_handlers import register_error_handlers
from interface.middleware import (
    MetricsAndLoggingMiddleware,
    RateLimitMiddleware,
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging(settings.log_level, settings.log_json)
    log = get_logger("startup")
    init_sentry(settings.sentry_dsn, settings.app_env)
    init_tracing(settings.otel_service_name, settings.otel_exporter_otlp_endpoint)
    init_db()
    ensure_content_columns(engine)
    with SessionLocal() as _s:
        inserted = seed_if_empty(_s)
    if inserted:
        log.info("Seeded catalog with %d titles", inserted)
    with SessionLocal() as _s2:
        p2 = backfill_and_seed(_s2)
    if any(p2.values()):
        log.info("Phase2 seed: %s", p2)
    BUILD_INFO.labels(settings.app_name, settings.app_env).set(1)
    log.info("Backend started: env=%s db=%s redis=%s", settings.app_env, settings.database_url.split("://")[0], settings.redis_enabled)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="OTT Streaming Platform API",
        version="0.1.0",
        description="Phase 0 foundation — health, observability, auth verification.",
        lifespan=lifespan,
    )

    # --- Middleware (registered inner-first; Starlette runs last-added outermost) ---
    # Desired runtime order (outermost -> innermost):
    #   RequestContext -> SecurityHeaders -> RateLimit -> CORS -> MetricsAndLogging
    app.add_middleware(MetricsAndLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Correlation-ID", "X-Response-Time-ms"],
    )
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestContextMiddleware)

    register_error_handlers(app)
    instrument_fastapi(app)

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    # Serve uploaded media (posters, etc.) from the local filesystem.
    media_root = Path(settings.media_dir)
    (media_root / "posters").mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(media_root)), name="media")

    @app.get("/metrics", include_in_schema=False)
    async def metrics() -> Response:
        body, content_type = render_metrics()
        return Response(content=body, media_type=content_type)

    @app.get("/", include_in_schema=False)
    async def root() -> dict:
        return {"data": {"service": settings.app_name, "docs": "/docs", "health": f"{settings.api_v1_prefix}/health"}, "error": None, "meta": {}}

    return app


app = create_app()
