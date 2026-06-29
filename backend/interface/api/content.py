"""Public content/catalog endpoints (Phase 1-2).

No authentication required for discovery. Responses use the standard envelope.
Static, specific routes are declared before the dynamic ``/{title_id}`` route.
"""
from __future__ import annotations

from fastapi import APIRouter, Body, Query

from application.services import content_service, review_service
from application.services import episode_service, playback_service
from interface.schemas import ok

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/home")
async def home() -> dict:
    return ok(content_service.home())


@router.get("/spotlight")
async def spotlight() -> dict:
    return ok(content_service.spotlight())


@router.get("/trending")
async def trending(limit: int = Query(14, ge=1, le=50)) -> dict:
    return ok(content_service.trending(limit))


@router.get("/moods")
async def moods() -> dict:
    return ok(content_service.moods())


@router.get("/facets")
async def facets() -> dict:
    return ok(content_service.facets())


@router.get("/mood/{mood}")
async def by_mood(mood: str, limit: int = Query(12, ge=1, le=50)) -> dict:
    return ok(content_service.by_mood(mood, limit))


@router.get("/type/{content_type}")
async def by_type(content_type: str, limit: int = Query(24, ge=1, le=60)) -> dict:
    return ok(content_service.by_type(content_type, limit))


@router.get("/genre/{genre}")
async def by_genre(genre: str, limit: int = Query(24, ge=1, le=60)) -> dict:
    return ok(content_service.by_genre(genre, limit))


@router.get("/type/{content_type}")
async def by_type(content_type: str, limit: int = Query(24, ge=1, le=60)) -> dict:
    return ok(content_service.by_type(content_type, limit))


@router.get("/genre/{genre}")
async def by_genre(genre: str, limit: int = Query(24, ge=1, le=60)) -> dict:
    return ok(content_service.by_genre(genre, limit))


@router.get("/search")
async def search(q: str = Query("", min_length=0, max_length=120), limit: int = Query(24, ge=1, le=60)) -> dict:
    results = content_service.search(q, limit) if q.strip() else []
    return ok(results, meta={"query": q, "count": len(results)})


@router.get("/taste-dna")
async def taste_dna() -> dict:
    return ok(content_service.taste_dna())


@router.get("/{title_id}")
async def detail(title_id: str) -> dict:
    return ok(content_service.get_title(title_id))


@router.get("/{title_id}/similar")
async def similar(title_id: str, limit: int = Query(8, ge=1, le=20)) -> dict:
    return ok(content_service.similar(title_id, limit))


@router.get("/{title_id}/reviews")
async def reviews(title_id: str, sort: str = Query("recent")) -> dict:
    result = review_service.list_reviews(title_id, sort)
    return ok(result, meta={"sort": sort, "count": len(result["items"])})


@router.post("/{title_id}/reviews/{review_id}/vote")
async def vote_review(title_id: str, review_id: str, helpful: bool = Body(..., embed=True)) -> dict:
    return ok(review_service.vote(title_id, review_id, helpful))


@router.get("/{title_id}/episodes")
async def episodes(title_id: str) -> dict:
    return ok(episode_service.get_episodes(title_id))


@router.get("/{title_id}/playback")
async def playback(title_id: str, ep: str | None = Query(None)) -> dict:
    return ok(playback_service.get_playback(title_id, ep))
