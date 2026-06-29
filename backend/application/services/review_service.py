"""Review use cases: list (with breakdown + sort) and helpful/not-helpful vote."""
from __future__ import annotations

from sqlalchemy import select

from application.services import content_service
from domain.exceptions import DomainException
from infrastructure.database.models import ReviewORM
from infrastructure.database.session import SessionLocal


class NotFoundError(DomainException):
    code = "NOT_FOUND"
    status = 404

    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message)


_SORTS = {"recent", "helpful", "critical", "positive"}


def _review(r: ReviewORM) -> dict:
    return {
        "id": r.id,
        "author": r.author,
        "rating": r.rating,
        "body": r.body,
        "has_spoilers": r.has_spoilers,
        "verified": r.verified,
        "helpful": r.helpful,
        "not_helpful": r.not_helpful,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


def _sorted(rows: list[ReviewORM], sort: str) -> list[ReviewORM]:
    from datetime import datetime, timezone

    epoch = datetime.min.replace(tzinfo=timezone.utc)
    if sort == "helpful":
        return sorted(rows, key=lambda r: r.helpful, reverse=True)
    if sort == "positive":
        return sorted(rows, key=lambda r: (r.rating, r.helpful), reverse=True)
    if sort == "critical":
        return sorted(rows, key=lambda r: (r.rating, -r.helpful))  # lowest rating first
    # recent (default)
    return sorted(rows, key=lambda r: r.created_at or epoch, reverse=True)


def list_reviews(content_id: str, sort: str = "recent") -> dict:
    sort = sort if sort in _SORTS else "recent"
    with SessionLocal() as s:
        rows = list(s.scalars(select(ReviewORM).where(ReviewORM.content_id == content_id)))
    return {
        "breakdown": content_service.rating_breakdown(content_id),
        "items": [_review(r) for r in _sorted(rows, sort)],
    }


def vote(content_id: str, review_id: str, helpful: bool) -> dict:
    with SessionLocal() as s:
        r = s.get(ReviewORM, review_id)
        if r is None or r.content_id != content_id:
            raise NotFoundError(f"Review '{review_id}' not found")
        if helpful:
            r.helpful += 1
        else:
            r.not_helpful += 1
        s.commit()
        s.refresh(r)
        return _review(r)
