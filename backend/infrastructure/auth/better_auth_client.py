"""Server-to-server Better Auth session verification.

The browser authenticates against Better Auth (Next.js) which sets an HttpOnly
session cookie. When the frontend calls this backend it forwards that cookie.
This client verifies the cookie by calling Better Auth's ``get-session`` endpoint
and caches the (positive) result briefly to avoid a hop on every request.
"""
from __future__ import annotations

import json
import logging

import httpx

from domain.enums import Role
from domain.exceptions import UpstreamAuthError
from domain.models import DeviceSession, SessionContext, User
from infrastructure.cache.redis_client import get_cache
from infrastructure.config import get_settings

logger = logging.getLogger(__name__)

_CACHE_PREFIX = "session_verify:"


def _parse_user(data: dict) -> User:
    user = data.get("user") or {}
    role_raw = user.get("role") or Role.USER_FREE.value
    try:
        role = Role(role_raw)
    except ValueError:
        role = Role.USER_FREE
    return User(
        id=str(user.get("id", "")),
        email=str(user.get("email", "")),
        name=user.get("name"),
        role=role,
        email_verified=bool(user.get("emailVerified", False)),
    )


async def verify_session(cookie_header: str, *, ip: str | None = None, user_agent: str | None = None) -> SessionContext | None:
    """Verify a forwarded cookie. Returns SessionContext or None if invalid.

    Raises UpstreamAuthError if Better Auth cannot be reached.
    """
    if not cookie_header:
        return None

    settings = get_settings()
    cache = get_cache()
    cache_key = f"{_CACHE_PREFIX}{hash(cookie_header)}"

    cached = cache.get(cache_key)
    if cached:
        try:
            payload = json.loads(cached)
            user = _parse_user(payload)
            return SessionContext(
                session_id=payload.get("session", {}).get("id", "cached"),
                user=user,
                ip=ip,
                user_agent=user_agent,
            )
        except Exception:
            pass  # fall through to fresh verification

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                settings.session_verify_url,
                headers={"cookie": cookie_header},
            )
    except httpx.HTTPError as exc:
        logger.warning("Better Auth verify call failed: %s", exc)
        raise UpstreamAuthError() from exc

    if resp.status_code != 200:
        return None

    try:
        data = resp.json()
    except Exception:
        return None

    # Better Auth returns null body when no active session.
    if not data or not data.get("user"):
        return None

    cache.set(cache_key, json.dumps(data), ttl_seconds=settings.session_verify_cache_ttl_seconds)

    user = _parse_user(data)
    session = data.get("session") or {}
    return SessionContext(
        session_id=str(session.get("id", "")),
        user=user,
        ip=ip,
        user_agent=user_agent,
    )


async def list_sessions(cookie_header: str) -> list[DeviceSession]:
    """Proxy the user's active device sessions from Better Auth."""
    if not cookie_header:
        return []
    settings = get_settings()
    url = f"{settings.better_auth_url.rstrip('/')}/api/auth/list-sessions"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers={"cookie": cookie_header})
    except httpx.HTTPError as exc:
        raise UpstreamAuthError() from exc

    if resp.status_code != 200:
        return []
    try:
        items = resp.json() or []
    except Exception:
        return []

    sessions: list[DeviceSession] = []
    for it in items:
        sessions.append(
            DeviceSession(
                session_id=str(it.get("id", "")),
                user_id=str(it.get("userId", "")),
                ip=it.get("ipAddress"),
                user_agent=it.get("userAgent"),
                created_at=str(it.get("createdAt")) if it.get("createdAt") else None,
                last_active_at=str(it.get("updatedAt")) if it.get("updatedAt") else None,
            )
        )
    return sessions
