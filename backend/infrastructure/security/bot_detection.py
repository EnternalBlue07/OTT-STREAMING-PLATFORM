"""Bot detection hook (seam only).

Returns a neutral score in Phase 0. Later phases integrate a real provider
(e.g., WAF signals, device fingerprinting) behind this interface.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(slots=True)
class BotScore:
    score: float = 0.0          # 0.0 = human, 1.0 = certain bot
    is_bot: bool = False


class BotDetectionHook(Protocol):
    def score(self, user_agent: str | None, ip: str | None) -> BotScore: ...


class NoopBotDetectionHook:
    def score(self, user_agent: str | None, ip: str | None) -> BotScore:  # noqa: ARG002
        return BotScore(score=0.0, is_bot=False)


def get_bot_detection_hook() -> BotDetectionHook:
    return NoopBotDetectionHook()
