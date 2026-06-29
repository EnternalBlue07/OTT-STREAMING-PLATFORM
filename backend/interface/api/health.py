"""Health and readiness endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Response

from infrastructure.cache.redis_client import cache_is_redis, get_cache
from infrastructure.config import get_settings
from infrastructure.database.session import ping_database
from interface.schemas import ok

router = APIRouter(tags=["health"])

VERSION = "0.1.0"


@router.get("/health")
async def health() -> dict:
    """Liveness — does not check external dependencies."""
    settings = get_settings()
    return ok({"status": "ok", "service": settings.app_name, "version": VERSION})


@router.get("/readiness")
async def readiness(response: Response) -> dict:
    """Readiness — verifies DB and (optional) Redis connectivity."""
    settings = get_settings()
    deps: list[dict] = []

    db_up = ping_database()
    deps.append({"name": "database", "status": "up" if db_up else "down"})

    if settings.redis_enabled:
        redis_up = get_cache().ping() and cache_is_redis()
        deps.append({"name": "redis", "status": "up" if redis_up else "down"})
    else:
        deps.append({"name": "redis", "status": "skipped", "detail": "in-memory fallback (no REDIS_URL)"})

    required_down = [d for d in deps if d["status"] == "down"]
    ready = not required_down
    if not ready:
        response.status_code = 503

    return ok({"status": "ready" if ready else "degraded", "dependencies": deps})
