"""Content discovery use cases (DB-backed).

Trending, mood/type/genre discovery, search, similarity, and an aggregated
Taste-DNA profile. Projects ``ContentORM`` rows into the API's card/detail
shapes. The repository abstraction means the storage backend can change without
touching these use cases.
"""
from __future__ import annotations

from domain.content import Mood
from domain.exceptions import DomainException
from infrastructure.content.db_repository import repository
from infrastructure.database.models import ContentORM, ReviewORM
from infrastructure.database.session import SessionLocal
from sqlalchemy import select


class NotFoundError(DomainException):
    code = "NOT_FOUND"
    status = 404

    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message)


def _match_score(t: ContentORM) -> int:
    base = (t.rating / 10) * 0.7 + (t.trending_score / 100) * 0.3
    return max(60, min(99, round(base * 100)))


def _quality_labels(t: ContentORM) -> list[str]:
    return [q.get("label") for q in (t.qualities or []) if q.get("label")]


def _card(t: ContentORM) -> dict:
    """Compact projection for grids/rails."""
    return {
        "id": t.id,
        "title": t.title,
        "tagline": t.tagline,
        "year": t.year,
        "runtime_min": t.runtime_min,
        "maturity": t.maturity,
        "content_type": t.content_type,
        "genres": t.genres or [],
        "moods": t.moods or [],
        "languages": t.languages or [],
        "rating": t.rating,
        "accent": t.accent,
        "gradient": t.gradient or [],
        "badges": t.badges or [],
        "poster_url": t.poster_url,
        "quality_labels": _quality_labels(t),
        "match": _match_score(t),
    }


def rating_breakdown(content_id: str) -> dict:
    """Aggregate review ratings into {average, total, counts{1..5}}."""
    counts = {str(i): 0 for i in range(1, 6)}
    total = 0
    weighted = 0
    with SessionLocal() as s:
        for (r,) in s.execute(select(ReviewORM.rating).where(ReviewORM.content_id == content_id)):
            key = str(max(1, min(5, int(r))))
            counts[key] += 1
            total += 1
            weighted += int(r)
    average = round(weighted / total, 2) if total else 0.0
    return {"average": average, "total": total, "counts": counts}


def _detail(t: ContentORM) -> dict:
    """Full projection for the hero/detail surface."""
    return {
        **_card(t),
        "synopsis": t.synopsis,
        "vibe_tags": t.vibe_tags or [],
        "ott": t.ott or [],
        "qualities": t.qualities or [],
        "trending_score": t.trending_score,
        # Phase 2 detail data
        "trailers": t.trailers or [],
        "cast": t.cast or [],
        "content_info": t.content_info or {},
        "rating_breakdown": rating_breakdown(t.id),
    }


# --- Use cases -------------------------------------------------------------

def trending(limit: int = 12) -> list[dict]:
    return [_card(t) for t in repository.trending(limit)]


def by_mood(mood: str, limit: int = 12) -> list[dict]:
    valid = {m.value for m in Mood}
    if mood not in valid:
        raise NotFoundError(f"Unknown mood '{mood}'")
    return [_card(t) for t in repository.by_mood(mood, limit)]


def by_type(content_type: str, limit: int = 24) -> list[dict]:
    return [_card(t) for t in repository.by_type(content_type, limit)]


def by_genre(genre: str, limit: int = 24) -> list[dict]:
    return [_card(t) for t in repository.by_genre(genre, limit)]


def moods() -> list[dict]:
    labels = {
        "late-night": "Late Night", "adrenaline": "Adrenaline", "comfort": "Comfort Watch",
        "mind-bending": "Mind-Bending", "heartfelt": "Heartfelt", "epic": "Epic",
    }
    emoji = {
        "late-night": "🌙", "adrenaline": "⚡", "comfort": "☕",
        "mind-bending": "🌀", "heartfelt": "💛", "epic": "🏔️",
    }
    return [{"id": m.value, "label": labels[m.value], "emoji": emoji[m.value]} for m in Mood]


def get_title(title_id: str) -> dict:
    t = repository.get(title_id)
    if t is None:
        raise NotFoundError(f"Title '{title_id}' not found")
    return _detail(t)


def search(query: str, limit: int = 24) -> list[dict]:
    return [_card(t) for t in repository.search(query, limit)]


def spotlight() -> dict:
    top = repository.trending(1)
    if not top:
        raise NotFoundError("No content available")
    return _detail(top[0])


def similar(title_id: str, limit: int = 8) -> list[dict]:
    seed = repository.get(title_id)
    if seed is None:
        raise NotFoundError(f"Title '{title_id}' not found")

    def score(t: ContentORM) -> float:
        g = len(set(t.genres or []) & set(seed.genres or []))
        m = len(set(t.moods or []) & set(seed.moods or []))
        v = len(set(t.vibe_tags or []) & set(seed.vibe_tags or []))
        return g * 2 + m * 1.5 + v + t.rating / 10

    pool = [t for t in repository.all() if t.id != seed.id]
    ranked = sorted(pool, key=score, reverse=True)[:limit]
    return [_card(t) for t in ranked]


def taste_dna() -> dict:
    titles = repository.all()
    genre_weight: dict[str, float] = {}
    for t in titles:
        for g in t.genres or []:
            genre_weight[g] = genre_weight.get(g, 0.0) + t.rating
    peak = max(genre_weight.values()) if genre_weight else 1.0
    profile = [
        {"genre": g, "affinity": round(w / peak, 3)}
        for g, w in sorted(genre_weight.items(), key=lambda kv: kv[1], reverse=True)
    ]
    top = profile[0]["genre"] if profile else None
    return {"profile": profile[:8], "top_genre": top, "sample_size": len(titles)}


def home() -> dict:
    """One-call homepage payload: spotlight + curated rails + moods."""
    rails: list[dict] = [{"key": "trending", "title": "Trending Now", "items": trending(14)}]

    # Type sections (Movies / Web Series / TV Series)
    for ctype, title in (("movie", "🎬 Movies"), ("web-series", "📺 Web Series"), ("tv-series", "🍿 TV Series")):
        items = by_type(ctype, 18)
        if items:
            rails.append({"key": f"type:{ctype}", "title": title, "items": items})

    # Mood sections
    for m in moods():
        items = by_mood(m["id"], 12)
        if items:
            rails.append({"key": f"mood:{m['id']}", "title": f"{m['emoji']} {m['label']}", "items": items})

    return {"spotlight": spotlight(), "rails": rails, "moods": moods()}
