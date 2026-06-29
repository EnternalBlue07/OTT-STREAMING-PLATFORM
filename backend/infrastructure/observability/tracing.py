"""OpenTelemetry tracing hooks.

Sets up a TracerProvider. If ``OTEL_EXPORTER_OTLP_ENDPOINT`` is configured an
OTLP/HTTP exporter is attached; otherwise tracing is a safe no-op so local dev
needs no collector.
"""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

_initialized = False


def init_tracing(service_name: str, otlp_endpoint: str = "") -> None:
    global _initialized
    if _initialized:
        return

    try:
        from opentelemetry import trace
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider

        resource = Resource.create({"service.name": service_name})
        provider = TracerProvider(resource=resource)

        if otlp_endpoint:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
            from opentelemetry.sdk.trace.export import BatchSpanProcessor

            exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            provider.add_span_processor(BatchSpanProcessor(exporter))
            logger.info("OpenTelemetry tracing enabled (OTLP endpoint configured).")
        else:
            logger.info("OpenTelemetry tracing initialized in no-op mode (no exporter).")

        trace.set_tracer_provider(provider)
        _initialized = True
    except Exception as exc:  # pragma: no cover - tracing must never break boot
        logger.warning("Tracing init skipped: %s", exc)


def instrument_fastapi(app) -> None:
    """Best-effort auto-instrumentation; silently skipped if unavailable."""
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

        FastAPIInstrumentor.instrument_app(app)
    except Exception:  # pragma: no cover
        logger.debug("FastAPI OTel auto-instrumentation not installed; skipping.")
