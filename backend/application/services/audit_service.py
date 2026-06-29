"""Audit logging for security-relevant events.

Phase 0 writes structured (PII-masked) audit lines and increments auth metrics.
The interface is DB-ready: ``record`` can later also persist to an audit table.
"""
from __future__ import annotations

import logging

from domain.enums import AuthEventType
from infrastructure.observability.logging import log_with_extra
from infrastructure.observability.metrics import record_auth_event

logger = logging.getLogger("audit")


def record(event_type: AuthEventType, actor: str | None = None, context: dict | None = None) -> None:
    """Record a security-relevant event to the audit log and metrics."""
    record_auth_event(event_type.value)
    log_with_extra(
        logger,
        logging.INFO,
        "audit_event",
        {
            "event_type": event_type.value,
            "actor": actor,
            **(context or {}),
        },
    )
