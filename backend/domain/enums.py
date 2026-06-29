"""Domain enumerations. Pure stdlib — no framework imports."""
from __future__ import annotations

from enum import Enum


class Role(str, Enum):
    """RBAC roles. Phase 0 distinguishes free/premium users and admins."""

    USER_FREE = "user:free"
    USER_PREMIUM = "user:premium"
    ADMIN_CONTENT = "admin:content"
    ADMIN_BILLING = "admin:billing"


class AuthEventType(str, Enum):
    """Security-relevant authentication events for the audit trail."""

    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    SESSION_VERIFIED = "session_verified"
    SESSION_REJECTED = "session_rejected"
    SESSION_REVOKED = "session_revoked"


class AnomalyLevel(str, Enum):
    """Output of a session anomaly evaluation."""

    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
