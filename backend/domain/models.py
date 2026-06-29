"""Domain entities. Pure dataclasses — no ORM, no framework imports.

The dependency rule: this module imports only from the standard library and
from ``domain`` itself.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from domain.enums import AnomalyLevel, Role


@dataclass(slots=True)
class User:
    """A platform user as understood by business logic."""

    id: str
    email: str
    name: str | None = None
    role: Role = Role.USER_FREE
    email_verified: bool = False


@dataclass(slots=True)
class SessionContext:
    """An authenticated session bound to its originating device context."""

    session_id: str
    user: User
    ip: str | None = None
    user_agent: str | None = None


@dataclass(slots=True)
class DeviceSession:
    """A single active device session for the 'manage devices' view."""

    session_id: str
    user_id: str
    ip: str | None = None
    user_agent: str | None = None
    created_at: str | None = None
    last_active_at: str | None = None
    current: bool = False


@dataclass(slots=True)
class AnomalySignal:
    """Result of evaluating a session for suspicious behavior."""

    level: AnomalyLevel = AnomalyLevel.NONE
    reasons: list[str] = field(default_factory=list)

    @property
    def is_suspicious(self) -> bool:
        return self.level != AnomalyLevel.NONE
