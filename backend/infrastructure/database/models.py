"""ORM models (persistence layer).

Phase 2 introduces a persisted content catalog (movies / web-series / tv-series)
with quality variants and an uploaded poster. Users are still derived from the
verified Better Auth session, so no user table here.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from infrastructure.database.session import Base

__all__ = ["Base", "ContentORM", "ReviewORM", "EpisodeORM"]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ContentORM(Base):
    """A catalog title. JSON columns keep flexible list/struct metadata."""

    __tablename__ = "content"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False, index=True)
    tagline: Mapped[str] = mapped_column(String, default="")
    synopsis: Mapped[str] = mapped_column(Text, default="")
    year: Mapped[int] = mapped_column(Integer, default=2024, index=True)
    runtime_min: Mapped[int] = mapped_column(Integer, default=0)
    maturity: Mapped[str] = mapped_column(String, default="PG-13")
    content_type: Mapped[str] = mapped_column(String, default="movie", index=True)

    genres: Mapped[list] = mapped_column(JSON, default=list)
    moods: Mapped[list] = mapped_column(JSON, default=list)
    vibe_tags: Mapped[list] = mapped_column(JSON, default=list)
    languages: Mapped[list] = mapped_column(JSON, default=list)
    ott: Mapped[list] = mapped_column(JSON, default=list)
    badges: Mapped[list] = mapped_column(JSON, default=list)
    gradient: Mapped[list] = mapped_column(JSON, default=list)
    qualities: Mapped[list] = mapped_column(JSON, default=list)

    rating: Mapped[float] = mapped_column(Float, default=0.0)
    trending_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    accent: Mapped[str] = mapped_column(String, default="#564DFF")
    poster_url: Mapped[str | None] = mapped_column(String, nullable=True)

    # --- Phase 2: detail + playback metadata (JSON columns) ---
    trailers: Mapped[list] = mapped_column(JSON, default=list)
    cast: Mapped[list] = mapped_column(JSON, default=list)
    content_info: Mapped[dict] = mapped_column(JSON, default=dict)
    hls_url: Mapped[str | None] = mapped_column(String, nullable=True)
    audio_tracks: Mapped[list] = mapped_column(JSON, default=list)
    subtitle_tracks: Mapped[list] = mapped_column(JSON, default=list)
    skip_markers: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(default=_utcnow)


class ReviewORM(Base):
    """A user review for a title. Rating breakdown is computed from these rows."""

    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    content_id: Mapped[str] = mapped_column(String, ForeignKey("content.id"), index=True)
    author: Mapped[str] = mapped_column(String, default="anonymous")
    rating: Mapped[int] = mapped_column(Integer, default=5)  # 1..5
    body: Mapped[str] = mapped_column(Text, default="")
    has_spoilers: Mapped[bool] = mapped_column(Boolean, default=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    helpful: Mapped[int] = mapped_column(Integer, default=0)
    not_helpful: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)


class EpisodeORM(Base):
    """An episode within a series title."""

    __tablename__ = "episodes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    content_id: Mapped[str] = mapped_column(String, ForeignKey("content.id"), index=True)
    season: Mapped[int] = mapped_column(Integer, default=1)
    episode: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String, default="")
    synopsis: Mapped[str] = mapped_column(Text, default="")
    runtime_min: Mapped[int] = mapped_column(Integer, default=0)
    thumbnail_url: Mapped[str | None] = mapped_column(String, nullable=True)
    hls_url: Mapped[str | None] = mapped_column(String, nullable=True)
    skip_markers: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
