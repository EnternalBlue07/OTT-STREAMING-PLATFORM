"""Content domain entities for the catalog.

Pure dataclasses — no ORM, no framework imports. Rich metadata (accent color,
gradient stops, moods, vibe tags) powers the cinematic, ambient frontend.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class Mood(str, Enum):
    """Contextual moods for AI-style discovery (rule-based in Phase 1)."""

    LATE_NIGHT = "late-night"
    ADRENALINE = "adrenaline"
    COMFORT = "comfort"
    MIND_BENDING = "mind-bending"
    HEARTFELT = "heartfelt"
    EPIC = "epic"


class ContentType(str, Enum):
    """What kind of title this is."""

    MOVIE = "movie"
    WEB_SERIES = "web-series"
    TV_SERIES = "tv-series"


# Allowed quality ladder labels (admin can attach any subset).
QUALITY_LABELS = ("480p", "720p", "1080p", "4K")


@dataclass(slots=True)
class Quality:
    """A single downloadable/streamable quality variant."""

    label: str           # one of QUALITY_LABELS
    size_mb: int = 0     # approximate size
    url: str | None = None  # optional source/stream URL


@dataclass(slots=True)
class Title:
    """A catalog title with cinematic presentation metadata."""

    id: str
    title: str
    tagline: str
    synopsis: str
    year: int
    runtime_min: int
    maturity: str          # e.g. "PG-13", "TV-MA"
    genres: list[str]
    moods: list[str]
    vibe_tags: list[str]
    rating: float          # 0-10
    accent: str            # hex, drives ambient lighting/glow
    gradient: list[str]    # 2-3 hex stops for the poster/backdrop
    badges: list[str] = field(default_factory=list)
    trending_score: float = 0.0
    runtime_label: str = ""
    # --- Phase 2 additions ---
    content_type: str = ContentType.MOVIE.value
    languages: list[str] = field(default_factory=list)
    ott: list[str] = field(default_factory=list)
    poster_url: str | None = None
    qualities: list[Quality] = field(default_factory=list)

    def matches(self, query: str) -> bool:
        """Lightweight in-memory full-text match (Postgres FTS deferred)."""
        q = query.lower().strip()
        if not q:
            return False
        haystack = " ".join(
            [self.title, self.tagline, self.synopsis, *self.genres, *self.vibe_tags,
             *self.moods, *self.languages, *self.ott, self.content_type]
        ).lower()
        return all(token in haystack for token in q.split())


@dataclass(slots=True)
class Trailer:
    """A trailer/teaser/clip entry for a title."""

    id: str
    title: str
    kind: str  # trailer | teaser | bts | interview
    thumbnail_url: str | None = None
    src: str = ""


@dataclass(slots=True)
class CastMember:
    """A cast or crew member."""

    id: str
    name: str
    character: str = ""
    photo_url: str | None = None
    role: str = "actor"  # actor | director


@dataclass(slots=True)
class ContentInfo:
    """Audio/subtitle/accessibility/warning metadata for the info panel."""

    audio_languages: list[str]
    subtitle_languages: list[str]
    accessibility: list[str]
    content_warning: str = ""
    studio: str = ""
    release_date: str = ""


@dataclass(slots=True)
class SkipMarker:
    """A labeled interval (seconds) used by Smart Skip."""

    start: float
    end: float
