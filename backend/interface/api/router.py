"""Aggregate the versioned API router."""
from __future__ import annotations

from fastapi import APIRouter

from interface.api import admin, auth, content, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(content.router)
api_router.include_router(admin.router)
