"""Structured (JSON) logging with request/correlation IDs and PII masking."""
from __future__ import annotations

import json
import logging
import sys
from typing import Any

from infrastructure.observability.context import get_correlation_id, get_request_id
from infrastructure.security.pii import mask_pii


class JsonFormatter(logging.Formatter):
    """Render log records as a single JSON line, with request context and PII masking."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": get_request_id(),
            "correlation_id": get_correlation_id(),
        }

        # Merge structured extras (set via logger.info(..., extra={"extra": {...}})).
        extra = getattr(record, "extra", None)
        if isinstance(extra, dict):
            payload.update(mask_pii(extra))

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


class PlainFormatter(logging.Formatter):
    """Human-readable formatter for local dev when JSON is disabled."""

    def format(self, record: logging.LogRecord) -> str:
        base = f"[{record.levelname}] {record.name} rid={get_request_id()} :: {record.getMessage()}"
        extra = getattr(record, "extra", None)
        if isinstance(extra, dict):
            base += f" :: {json.dumps(mask_pii(extra), default=str)}"
        if record.exc_info:
            base += "\n" + self.formatException(record.exc_info)
        return base


def configure_logging(level: str = "INFO", json_output: bool = True) -> None:
    """Configure root logging once at application startup."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter() if json_output else PlainFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())

    # Quiet noisy access logs; our middleware emits structured request logs.
    logging.getLogger("uvicorn.access").handlers.clear()
    logging.getLogger("uvicorn.access").propagate = False


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def log_with_extra(logger: logging.Logger, level: int, message: str, extra: dict[str, Any]) -> None:
    """Emit a log line carrying a structured (PII-masked) extra payload."""
    logger.log(level, message, extra={"extra": extra})
