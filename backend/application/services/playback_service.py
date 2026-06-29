"""Playback use case: resolve HLS source, renditions, tracks, and skip markers.

For a movie, sources come from the title. For an episode (``ep``), sources come
from that episode and ``next_episode_id`` points to the following episode.
"""
from __future__ import annotations

from sqlalchemy import select

from domain.exceptions import DomainException
from infrastructure.database.models import ContentORM, EpisodeORM
from infrastructure.database.session import SessionLocal

# Informational rendition ladder (the actually-selectable levels come from the
# parsed HLS manifest; these labels drive the quality menu's display).
_RENDITION_META = {
    "4K": {"height": 2160, "bitrate": 15_000_000},
    "1080p": {"height": 1080, "bitrate": 5_000_000},
    "720p": {"height": 720, "bitrate": 2_500_000},
    "480p": {"height": 480, "bitrate": 1_000_000},
}
_DEFAULT_LABELS = ["4K", "1080p", "720p", "480p"]


class NotFoundError(DomainException):
    code = "NOT_FOUND"
    status = 404

    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message)


def _renditions(labels: list[str]) -> list[dict]:
    use = labels or _DEFAULT_LABELS
    out = []
    for lbl in use:
        meta = _RENDITION_META.get(lbl)
        if meta:
            out.append({"label": lbl, **meta})
    # Highest first
    return sorted(out, key=lambda r: r["height"], reverse=True)


def get_playback(content_id: str, episode_id: str | None = None) -> dict:
    with SessionLocal() as s:
        title = s.get(ContentORM, content_id)
        if title is None:
            raise NotFoundError(f"Title '{content_id}' not found")

        quality_labels = [q.get("label") for q in (title.qualities or []) if q.get("label")]
        renditions = _renditions(quality_labels)

        hls_url = title.hls_url
        skip_markers = title.skip_markers or {}
        play_title = title.title
        next_episode_id = None

        if episode_id:
            ep = s.get(EpisodeORM, episode_id)
            if ep is None or ep.content_id != content_id:
                raise NotFoundError(f"Episode '{episode_id}' not found")
            hls_url = ep.hls_url or hls_url
            skip_markers = ep.skip_markers or skip_markers
            play_title = f"{title.title} — S{ep.season}E{ep.episode}"
            # Find the next episode by (season, episode) order.
            siblings = list(
                s.scalars(
                    select(EpisodeORM)
                    .where(EpisodeORM.content_id == content_id)
                    .order_by(EpisodeORM.season, EpisodeORM.episode)
                )
            )
            ids = [e.id for e in siblings]
            i = ids.index(ep.id)
            next_episode_id = ids[i + 1] if i + 1 < len(ids) else None

        return {
            "title": play_title,
            "hls_url": hls_url,
            "native_hls": False,
            "renditions": renditions,
            "audio_tracks": title.audio_tracks or [],
            "subtitle_tracks": title.subtitle_tracks or [],
            "skip_markers": skip_markers,
            "next_episode_id": next_episode_id,
            "start_at": 0,
            "accent": title.accent or "#564DFF",
            "gradient": title.gradient or [],
        }
