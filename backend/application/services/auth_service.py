"""Authentication use cases for the backend.

Verifies Better Auth sessions, records audit events, runs the anomaly hook, and
returns domain objects to the interface layer.
"""
from __future__ import annotations

from domain.enums import AuthEventType
from domain.exceptions import UnauthorizedError
from domain.models import DeviceSession, SessionContext
from infrastructure.auth import better_auth_client
from infrastructure.security.anomaly import evaluate_session
from application.services import audit_service


async def get_current_session(
    cookie_header: str, *, ip: str | None = None, user_agent: str | None = None
) -> SessionContext:
    """Verify the forwarded session cookie and return its context, or raise 401."""
    session = await better_auth_client.verify_session(cookie_header, ip=ip, user_agent=user_agent)
    if session is None:
        audit_service.record(AuthEventType.SESSION_REJECTED, context={"ip": ip})
        raise UnauthorizedError()

    signal = evaluate_session(session)
    audit_service.record(
        AuthEventType.SESSION_VERIFIED,
        actor=session.user.id,
        context={"ip": ip, "anomaly": signal.level.value, "reasons": signal.reasons},
    )
    return session


async def get_device_sessions(cookie_header: str) -> list[DeviceSession]:
    """Return the active device sessions for the current user."""
    return await better_auth_client.list_sessions(cookie_header)
