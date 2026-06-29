"""Episode use cases: list seasons → episodes for a series title."""
from __future__ import annotations

from sqlalchemy import select

from infrastructure.database.models import ContentORM, EpisodeORM
from infrastructure.database.session import SessionLocal


def _episode(e: EpisodeORM) -> dict:
    return {
        "id": e.id,
        "season": e.season,
        "episode": e.episode,
        "title": e.title,
        "synopsis": e.synopsis,
        "runtime_min": e.runtime_min,
        "thumbnail_url": e.thumbnail_url,
        "watched": False,  # per-user progress arrives with the watch-history phase
    }


def get_episodes(content_id: str) -> dict:
    with SessionLocal() as s:
        title = s.get(ContentORM, content_id)
        content_type = title.content_type if title else "movie"
        rows = list(
            s.scalars(
                select(EpisodeORM)
                .where(EpisodeORM.content_id == content_id)
                .order_by(EpisodeORM.season, EpisodeORM.episode)
            )
        )

    seasons: dict[int, list[dict]] = {}
    for e in rows:
        seasons.setdefault(e.season, []).append(_episode(e))

    return {
        "content_type": content_type,
        "seasons": [{"season": s_no, "episodes": eps} for s_no, eps in sorted(seasons.items())],
    }
