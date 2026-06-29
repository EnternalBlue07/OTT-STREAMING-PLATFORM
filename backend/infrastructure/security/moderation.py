"""Content moderation hook (seam only).

Phase 0 leaves a documented interface so later phases can plug in real
moderation (text/image classification, report queues) without re-architecting.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(slots=True)
class ModerationResult:
    allowed: bool = True
    reason: str | None = None


class ContentModerationHook(Protocol):
    def check(self, payload: dict[str, Any]) -> ModerationResult: ...


class NoopModerationHook:
    """Default Phase 0 hook: allows everything (no moderation implemented yet)."""

    def check(self, payload: dict[str, Any]) -> ModerationResult:  # noqa: ARG002
        return ModerationResult(allowed=True)


def get_moderation_hook() -> ContentModerationHook:
    return NoopModerationHook()
