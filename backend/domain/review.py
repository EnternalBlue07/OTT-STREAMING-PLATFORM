"""Review domain entity. Pure dataclass — no ORM/framework imports."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Review:
    id: str
    content_id: str
    author: str
    rating: int  # 1..5
    body: str
    has_spoilers: bool = False
    verified: bool = False
    helpful: int = 0
    not_helpful: int = 0
    created_at: str | None = None
