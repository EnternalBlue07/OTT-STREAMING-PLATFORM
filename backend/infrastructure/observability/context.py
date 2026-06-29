"""Request-scoped context (request ID + correlation ID) via contextvars.

Bound by the request-context middleware and read by the logging layer so every
log line can be correlated to a single request across the call stack.
"""
from __future__ import annotations

import contextvars

request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
correlation_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("correlation_id", default="-")


def set_request_context(request_id: str, correlation_id: str) -> None:
    request_id_var.set(request_id)
    correlation_id_var.set(correlation_id)


def get_request_id() -> str:
    return request_id_var.get()


def get_correlation_id() -> str:
    return correlation_id_var.get()
