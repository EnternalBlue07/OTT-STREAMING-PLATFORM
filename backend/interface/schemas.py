"""Pydantic schemas and the standard response envelope."""
from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorBody(BaseModel):
    code: str
    message: str
    status: int


class Envelope(BaseModel, Generic[T]):
    data: T | None = None
    error: ErrorBody | None = None
    meta: dict[str, Any] = {}


def ok(data: Any = None, meta: dict[str, Any] | None = None) -> dict[str, Any]:
    """Build a success envelope."""
    return {"data": data, "error": None, "meta": meta or {}}


def err(code: str, message: str, status: int, meta: dict[str, Any] | None = None) -> dict[str, Any]:
    """Build an error envelope."""
    return {
        "data": None,
        "error": {"code": code, "message": message, "status": status},
        "meta": meta or {},
    }


# --- Domain response models ---

class UserOut(BaseModel):
    id: str
    email: str
    name: str | None = None
    role: str
    email_verified: bool


class DeviceSessionOut(BaseModel):
    session_id: str
    ip: str | None = None
    user_agent: str | None = None
    created_at: str | None = None
    last_active_at: str | None = None
    current: bool = False


class HealthOut(BaseModel):
    status: str
    service: str
    version: str


class DependencyStatus(BaseModel):
    name: str
    status: str          # "up" | "down" | "skipped"
    detail: str | None = None


class ReadinessOut(BaseModel):
    status: str          # "ready" | "degraded"
    dependencies: list[DependencyStatus]
