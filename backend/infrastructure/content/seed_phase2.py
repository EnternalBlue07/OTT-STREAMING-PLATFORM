"""Phase-2 backfill + seed: detail metadata, playback, reviews, episodes.

Idempotent and additive:
- Backfills new ``content`` columns for any title missing ``hls_url``.
- Seeds the ``reviews`` table once (when empty).
- Seeds the ``episodes`` table once (when empty) for series titles.

Deterministic generators (no randomness) so repeated runs are stable. Uses the
public Mux multi-rendition test stream as ``hls_url`` so the player's ABR /
quality / track selectors are genuinely real until a real encoder exists.
"""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from infrastructure.database.models import ContentORM, EpisodeORM, ReviewORM
from infrastructure.observability.logging import get_logger

_log = get_logger("seed_phase2")

# Public, CORS-enabled, multi-rendition HLS test stream (real ABR levels).
SAMPLE_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"

_LANG_CODE = {
    "Hindi": "hi", "English": "en", "Spanish": "es", "French": "fr",
    "Japanese": "ja", "Korean": "ko", "Tamil": "ta", "Telugu": "te",
}

_STUDIOS = [
    "Aurora Pictures", "Meridian Studios", "Nightjar Films", "Sterling House",
    "Lighthouse Originals", "Vertex Motion", "Cobalt Pictures", "Ember & Co.",
]

_REVIEW_AUTHORS = [
    "cineaste_07", "reelreviewer", "midnight_watcher", "frame_by_frame",
    "popcorn_pundit", "the_binger", "sofa_critic", "auteur_alex",
]
_REVIEW_BODIES = [
    ("Hooks you from the first frame and never lets go.", 5, False),
    ("Gorgeous to look at, even if the pacing sags in the middle.", 4, False),
    ("The ending recontextualizes everything — watch it twice.", 5, True),
    ("Solid performances, but the plot telegraphs its twists.", 3, False),
    ("Style over substance. Pretty, hollow.", 2, False),
    ("A quiet, confident piece of filmmaking. Stayed with me for days.", 5, False),
    ("Overhyped. I wanted to love it but kept checking the time.", 2, False),
    ("Wildly entertaining — exactly what a Friday night needs.", 4, False),
]

_WARNINGS = {
    "U": "Suitable for all audiences.",
    "PG": "Mild thematic elements.",
    "PG-13": "Some violence and brief language.",
    "TV-14": "Mature themes, some violence and language.",
    "TV-MA": "Strong language, violence, and mature themes.",
    "R": "Strong violence, language, and adult content.",
}

_EPISODE_TITLES = [
    "Ashfall", "The Long Quiet", "Borrowed Light", "Salt & Static",
    "What the River Keeps", "Last Transmission", "Glass Hours", "The Reckoning",
]


def _idx(seed: str, n: int) -> int:
    return (sum(ord(c) for c in seed) % n) if n else 0


def _content_info(c: ContentORM) -> dict:
    langs = list(c.languages or ["English"])
    subs = sorted(set(langs) | {"English", "Spanish"})
    access = ["Closed Captions"] + (["Audio Description"] if (c.rating or 0) >= 8.0 else [])
    month = (_idx(c.id, 12) + 1)
    day = (_idx(c.title, 27) + 1)
    return {
        "audio_languages": langs,
        "subtitle_languages": subs,
        "accessibility": access,
        "content_warning": _WARNINGS.get(c.maturity, "Some mature themes."),
        "studio": _STUDIOS[_idx(c.title, len(_STUDIOS))],
        "release_date": f"{c.year}-{month:02d}-{day:02d}",
    }


def _tracks(c: ContentORM) -> tuple[list, list]:
    langs = list(c.languages or ["English"])
    audio = [{"id": f"a{i}", "label": l, "lang": _LANG_CODE.get(l, "en")} for i, l in enumerate(langs)]
    subs_langs = sorted(set(langs) | {"English"})
    subtitle = [{"id": f"s{i}", "label": l, "lang": _LANG_CODE.get(l, "en"), "src": ""} for i, l in enumerate(subs_langs)]
    return audio, subtitle


def _trailers(c: ContentORM) -> list:
    return [
        {"id": "t1", "title": "Official Trailer", "kind": "trailer", "thumbnail_url": None, "src": SAMPLE_HLS},
        {"id": "t2", "title": "Teaser", "kind": "teaser", "thumbnail_url": None, "src": SAMPLE_HLS},
    ]


def _cast(c: ContentORM) -> list:
    firsts = ["Aria", "Devin", "Mira", "Kabir", "Noor", "Ravi", "Lena", "Theo", "Sana", "Ivo"]
    lasts = ["Mensah", "Okafor", "Varma", "Solberg", "Khan", "Reyes", "Dubois", "Nair", "Holt", "Costa"]
    chars = ["Cmdr. Vael", "The Stranger", "Detective Roy", "Mara", "The Pilot", "Anya", "Sgt. Pike", "Elias"]
    n = 4 + _idx(c.id, 3)  # 4..6
    members = []
    for i in range(n):
        fi = _idx(c.id + str(i), len(firsts))
        li = _idx(c.title + str(i), len(lasts))
        ci = _idx(c.id + c.title + str(i), len(chars))
        members.append({
            "id": f"c{i}", "name": f"{firsts[fi]} {lasts[li]}",
            "character": chars[ci], "photo_url": None, "role": "actor",
        })
    di = _idx(c.title, len(firsts))
    members.append({
        "id": "d1", "name": f"{firsts[di]} {lasts[(di + 3) % len(lasts)]}",
        "character": "", "photo_url": None, "role": "director",
    })
    return members


def _skip_markers() -> dict:
    # Scaled to the ~60s sample clip so buttons are demonstrable.
    return {"intro": {"start": 5, "end": 18}, "recap": None, "credits": {"start": 50}}


def _reviews_for(c: ContentORM) -> list[ReviewORM]:
    count = 3 + _idx(c.id, 4)  # 3..6
    out = []
    for i in range(count):
        body, rating, spoiler = _REVIEW_BODIES[_idx(c.id + str(i), len(_REVIEW_BODIES))]
        author = _REVIEW_AUTHORS[_idx(c.title + str(i), len(_REVIEW_AUTHORS))]
        out.append(ReviewORM(
            id=f"{c.id}-r{i}",
            content_id=c.id,
            author=author,
            rating=rating,
            body=body,
            has_spoilers=spoiler,
            verified=(i % 2 == 0),
            helpful=(7 * (i + 1)) % 53,
            not_helpful=(3 * i) % 11,
        ))
    return out


def _episodes_for(c: ContentORM) -> list[EpisodeORM]:
    out = []
    for ep in range(1, 7):  # Season 1, 6 episodes
        title = _EPISODE_TITLES[(ep - 1) % len(_EPISODE_TITLES)]
        out.append(EpisodeORM(
            id=f"{c.id}-s1e{ep}",
            content_id=c.id,
            season=1,
            episode=ep,
            title=f"{ep}. {title}",
            synopsis=f"Episode {ep} of {c.title}. The stakes rise as old secrets surface.",
            runtime_min=42 + (ep % 3) * 6,
            thumbnail_url=None,
            hls_url=SAMPLE_HLS,
            skip_markers=_skip_markers(),
        ))
    return out


def backfill_and_seed(session: Session) -> dict:
    """Backfill content columns and seed reviews/episodes. Idempotent."""
    backfilled = 0
    rows = list(session.scalars(select(ContentORM)))
    for c in rows:
        if c.hls_url:
            continue  # already backfilled
        c.hls_url = SAMPLE_HLS
        c.trailers = _trailers(c)
        c.cast = _cast(c)
        c.content_info = _content_info(c)
        audio, subtitle = _tracks(c)
        c.audio_tracks = audio
        c.subtitle_tracks = subtitle
        c.skip_markers = _skip_markers()
        backfilled += 1

    reviews_added = 0
    if (session.scalar(select(func.count()).select_from(ReviewORM)) or 0) == 0:
        for c in rows:
            revs = _reviews_for(c)
            session.add_all(revs)
            reviews_added += len(revs)

    episodes_added = 0
    if (session.scalar(select(func.count()).select_from(EpisodeORM)) or 0) == 0:
        for c in rows:
            if c.content_type in ("web-series", "tv-series"):
                eps = _episodes_for(c)
                session.add_all(eps)
                episodes_added += len(eps)

    if backfilled or reviews_added or episodes_added:
        session.commit()
        _log.info(
            "Phase2 backfilled %d titles, %d reviews, %d episodes",
            backfilled, reviews_added, episodes_added,
        )
    return {"backfilled": backfilled, "reviews": reviews_added, "episodes": episodes_added}
