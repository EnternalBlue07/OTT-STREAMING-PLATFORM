"""FastAPI dependency-injection helpers."""
from __future__ import annotations

from fastapi import Request

from domain.models import SessionContext
from application.services import auth_service


def get_cookie_header(request: Request) -> str:
    return request.headers.get("cookie", "")


def client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")


async def require_session(request: Request) -> SessionContext:
    """Dependency that verifies the Better Auth session or raises 401."""
    return await auth_service.get_current_session(
        get_cookie_header(request),
        ip=client_ip(request),
        user_agent=user_agent(request),
    )
