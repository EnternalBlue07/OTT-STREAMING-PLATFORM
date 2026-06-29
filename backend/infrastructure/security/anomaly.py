"""Session anomaly detection hook.

Phase 0 provides the seam and lightweight heuristics (device/IP change tracking)
but does not block. Later phases plug in richer scoring (impossible travel, etc.).
"""
from __future__ import annotations

from domain.enums import AnomalyLevel
from domain.models import AnomalySignal, SessionContext
from infrastructure.cache.redis_client import get_cache


def evaluate_session(context: SessionContext) -> AnomalySignal:
    """Return an AnomalySignal. Phase 0 flags only obvious device/IP churn."""
    reasons: list[str] = []
    cache = get_cache()

    last_ua_key = f"anomaly:last_ua:{context.user.id}"
    last_ua = cache.get(last_ua_key)
    if context.user_agent:
        if last_ua and last_ua != context.user_agent:
            reasons.append("user_agent_changed")
        cache.set(last_ua_key, context.user_agent, ttl_seconds=86400)

    level = AnomalyLevel.LOW if reasons else AnomalyLevel.NONE
    return AnomalySignal(level=level, reasons=reasons)
