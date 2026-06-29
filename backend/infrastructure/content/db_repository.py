"""SQLite/SQLAlchemy-backed content repository.

Implements the same surface the application layer expects. The catalog is small,
so list-level filtering happens in Python (avoids JSON-column query dialect
quirks and keeps mood/vibe matching identical across backends).
"""
from __future__ import annotations

from sqlalchemy import select

from infrastructure.database.models import ContentORM
from infrastructure.database.session import SessionLocal


def _matches(row: ContentORM, query: str) -> bool:
    q = query.lower().strip()
    if not q:
        return False
    haystack = " ".join(
        [
            row.title or "",
            row.tagline or "",
            row.synopsis or "",
            *(row.genres or []),
            *(row.vibe_tags or []),
            *(row.moods or []),
            *(row.languages or []),
            row.content_type or "",
        ]
    ).lower()
    return all(token in haystack for token in q.split())


class DBContentRepository:
    """Concrete repository backed by the ``content`` table."""

    def all(self) -> list[ContentORM]:
        with SessionLocal() as s:
            return list(s.scalars(select(ContentORM)))

    def get(self, title_id: str) -> ContentORM | None:
        with SessionLocal() as s:
            return s.get(ContentORM, title_id)

    def trending(self, limit: int = 12) -> list[ContentORM]:
        return sorted(self.all(), key=lambda t: t.trending_score, reverse=True)[:limit]

    def by_mood(self, mood: str, limit: int = 12) -> list[ContentORM]:
        items = [t for t in self.all() if mood in (t.moods or [])]
        return sorted(items, key=lambda t: t.rating, reverse=True)[:limit]

    def by_type(self, content_type: str, limit: int = 24) -> list[ContentORM]:
        items = [t for t in self.all() if t.content_type == content_type]
        return sorted(items, key=lambda t: t.trending_score, reverse=True)[:limit]

    def by_genre(self, genre: str, limit: int = 24) -> list[ContentORM]:
        g = genre.lower()
        items = [t for t in self.all() if any(x.lower() == g for x in (t.genres or []))]
        return sorted(items, key=lambda t: t.trending_score, reverse=True)[:limit]

    def search(self, query: str, limit: int = 24) -> list[ContentORM]:
        items = [t for t in self.all() if _matches(t, query)]
        return sorted(items, key=lambda t: t.rating, reverse=True)[:limit]

    def genres(self) -> list[str]:
        seen: dict[str, int] = {}
        for t in self.all():
            for g in t.genres or []:
                seen[g] = seen.get(g, 0) + 1
        return sorted(seen, key=lambda g: seen[g], reverse=True)


repository = DBContentRepository()
