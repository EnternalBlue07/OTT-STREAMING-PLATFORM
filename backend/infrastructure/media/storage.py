"""Local filesystem media storage.

Stands in for S3/MinIO during no-Docker dev. Saves uploaded posters under
``<media_dir>/posters`` and returns a public URL served by the FastAPI static
mount at ``/media``. Swapping to S3 later means changing only this module.
"""
from __future__ import annotations

import re
import uuid
from pathlib import Path

from infrastructure.config import get_settings

_ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif", "image/gif": ".gif"}
_MAX_BYTES = 8 * 1024 * 1024  # 8 MB poster cap


def media_root() -> Path:
    root = Path(get_settings().media_dir)
    (root / "posters").mkdir(parents=True, exist_ok=True)
    return root


def slugify(value: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return s or uuid.uuid4().hex[:8]


class MediaError(Exception):
    pass


def save_poster(data: bytes, content_type: str, stem: str) -> str:
    """Persist a poster image and return its public URL.

    Raises ``MediaError`` for unsupported types or oversized files.
    """
    if content_type not in _ALLOWED:
        raise MediaError(f"Unsupported image type '{content_type}'. Use JPEG, PNG, WebP, AVIF, or GIF.")
    if len(data) > _MAX_BYTES:
        raise MediaError("Image exceeds the 8 MB limit.")

    ext = _ALLOWED[content_type]
    filename = f"{slugify(stem)}-{uuid.uuid4().hex[:6]}{ext}"
    dest = media_root() / "posters" / filename
    dest.write_bytes(data)

    base = get_settings().public_base_url.rstrip("/")
    return f"{base}/media/posters/{filename}"
