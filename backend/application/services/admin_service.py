"""Admin content management use cases: create / list / delete catalog titles.

Persists to the ``content`` table and stores uploaded posters via the media
module. Real, not dummy — uploaded titles immediately appear in discovery.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select

from application.services import content_service
from domain.exceptions import DomainException, ValidationError
from infrastructure.database.models import ContentORM
from infrastructure.database.session import SessionLocal
from infrastructure.media.storage import MediaError, save_poster, slugify

_VALID_TYPES = {"movie", "web-series", "tv-series"}
_VALID_QUALITIES = {"480p", "720p", "1080p", "4K"}


def _darken(hex_color: str, factor: float = 0.22) -> str:
    try:
        h = hex_color.lstrip("#")
        r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
        r, g, b = (int(c * factor) for c in (r, g, b))
        return f"#{r:02x}{g:02x}{b:02x}"
    except Exception:
        return "#141414"


def _unique_id(session, title: str) -> str:
    base = slugify(title)
    candidate = base
    n = 2
    while session.get(ContentORM, candidate) is not None:
        candidate = f"{base}-{n}"
        n += 1
    return candidate or uuid.uuid4().hex[:10]


def _clean_qualities(raw: list) -> list[dict]:
    out: list[dict] = []
    for q in raw or []:
        label = str(q.get("label", "")).strip()
        if label not in _VALID_QUALITIES:
            continue
        out.append(
            {
                "label": label,
                "size_mb": int(q.get("size_mb") or 0),
                "source_url": str(q.get("source_url", "")).strip(),
                "audio": str(q.get("audio", "")).strip() or "Original",
            }
        )
    # Stable ladder order
    order = {"480p": 0, "720p": 1, "1080p": 2, "4K": 3}
    return sorted(out, key=lambda q: order[q["label"]])


def list_content() -> list[dict]:
    with SessionLocal() as s:
        rows = list(s.scalars(select(ContentORM).order_by(ContentORM.created_at.desc())))
        return [content_service._detail(r) for r in rows]


def create_content(payload: dict) -> dict:
    """Create a catalog title from a JSON payload. Poster uploaded separately."""
    title = str(payload.get("title", "")).strip()
    if not title:
        raise ValidationError("Title is required")

    content_type = str(payload.get("content_type", "movie")).strip()
    if content_type not in _VALID_TYPES:
        raise ValidationError(f"content_type must be one of {sorted(_VALID_TYPES)}")

    accent = str(payload.get("accent", "#564DFF")).strip() or "#564DFF"
    gradient = payload.get("gradient") or [_darken(accent), accent, "#0A0A0A"]

    with SessionLocal() as s:
        cid = _unique_id(s, title)

        row = ContentORM(
            id=cid,
            title=title,
            tagline=str(payload.get("tagline", "")).strip(),
            synopsis=str(payload.get("synopsis", "")).strip(),
            year=int(payload.get("year") or 2024),
            runtime_min=int(payload.get("runtime_min") or 0),
            maturity=str(payload.get("maturity", "PG-13")).strip() or "PG-13",
            content_type=content_type,
            genres=list(payload.get("genres") or []),
            moods=list(payload.get("moods") or []),
            vibe_tags=list(payload.get("vibe_tags") or []),
            languages=list(payload.get("languages") or []),
            ott=list(payload.get("ott") or []),
            badges=list(payload.get("badges") or []),
            gradient=list(gradient),
            qualities=_clean_qualities(payload.get("qualities")),
            rating=float(payload.get("rating") or 0.0),
            trending_score=float(payload.get("trending_score") or 50.0),
            accent=accent,
            poster_url=None,
        )
        s.add(row)
        s.commit()
        s.refresh(row)
        return content_service._detail(row)


def set_poster(title_id: str, data: bytes, content_type: str) -> dict:
    """Save/replace a title's poster image and return the updated detail."""
    with SessionLocal() as s:
        row = s.get(ContentORM, title_id)
        if row is None:
            raise DomainException("Title not found", code="NOT_FOUND", status=404)
        try:
            row.poster_url = save_poster(data, content_type, row.id)
        except MediaError as e:
            raise ValidationError(str(e)) from e
        s.commit()
        s.refresh(row)
        return content_service._detail(row)


def delete_content(title_id: str) -> None:
    with SessionLocal() as s:
        row = s.get(ContentORM, title_id)
        if row is None:
            raise DomainException("Title not found", code="NOT_FOUND", status=404)
        s.delete(row)
        s.commit()
