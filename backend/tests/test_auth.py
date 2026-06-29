"""Auth verification tests: 401 without a session, 200 with a mocked session."""
from __future__ import annotations

import pytest

from domain.enums import Role
from domain.models import SessionContext, User
from infrastructure.auth import better_auth_client


def test_me_requires_session(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    body = resp.json()
    assert body["error"]["code"] == "UNAUTHORIZED"
    assert body["data"] is None


def test_me_returns_profile_with_valid_session(client, monkeypatch):
    async def fake_verify(cookie_header, *, ip=None, user_agent=None):
        return SessionContext(
            session_id="sess_123",
            user=User(id="u1", email="jane@example.com", name="Jane", role=Role.USER_PREMIUM, email_verified=True),
            ip=ip,
            user_agent=user_agent,
        )

    monkeypatch.setattr(better_auth_client, "verify_session", fake_verify)

    resp = client.get("/api/v1/auth/me", headers={"cookie": "better-auth.session=abc"})
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["email"] == "jane@example.com"
    assert data["role"] == Role.USER_PREMIUM.value
    assert data["email_verified"] is True
