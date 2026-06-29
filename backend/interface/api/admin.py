"""Admin content management endpoints (Phase 2).

Create / list / delete catalog titles, plus a separate poster upload (480p →
4K quality variants live on the title). Uploaded titles persist to SQLite and
appear immediately in public discovery.

NOTE: In local dev these endpoints are open for convenience. Production must
gate them behind the ``admin:content`` RBAC role (see steering/security).
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, UploadFile

from application.services import admin_service
from interface.schemas import ok

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/content")
async def list_content() -> dict:
    return ok(admin_service.list_content())


@router.post("/content")
async def create_content(payload: dict[str, Any]) -> dict:
    """Create a title from a JSON body. Poster is uploaded separately."""
    created = admin_service.create_content(payload)
    return ok(created, meta={"created": True})


@router.post("/content/{title_id}/poster")
async def upload_poster(title_id: str, file: UploadFile = File(...)) -> dict:
    """Attach/replace a title's poster image."""
    contents = await file.read()
    updated = admin_service.set_poster(
        title_id, contents, file.content_type or "application/octet-stream"
    )
    return ok(updated)


@router.delete("/content/{title_id}")
async def delete_content(title_id: str) -> dict:
    admin_service.delete_content(title_id)
    return ok({"deleted": title_id})
