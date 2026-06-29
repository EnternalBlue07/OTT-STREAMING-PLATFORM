"""Auth endpoints backed by Better Auth session verification."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from domain.models import SessionContext
from application.services import auth_service
from interface.dependencies import get_cookie_header, require_session
from interface.schemas import ok

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def me(session: SessionContext = Depends(require_session)) -> dict:
    """Return the current authenticated user's profile."""
    u = session.user
    return ok(
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role.value,
            "email_verified": u.email_verified,
        }
    )


@router.get("/sessions")
async def sessions(request: Request, session: SessionContext = Depends(require_session)) -> dict:
    """List the current user's active device sessions."""
    items = await auth_service.get_device_sessions(get_cookie_header(request))
    return ok(
        [
            {
                "session_id": s.session_id,
                "ip": s.ip,
                "user_agent": s.user_agent,
                "created_at": s.created_at,
                "last_active_at": s.last_active_at,
                "current": s.session_id == session.session_id,
            }
            for s in items
        ]
    )
