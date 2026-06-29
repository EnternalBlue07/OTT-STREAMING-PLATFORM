"""Seed the persisted catalog on first run.

Reuses the curated in-memory titles and adds more (web-series / tv-series and
extra films) so the catalog is full out of the box. Each title gets a realistic
quality ladder (480p → 4K). Idempotent: only seeds when the table is empty.
"""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from infrastructure.content.catalog import _SEED  # curated domain Titles
from infrastructure.database.models import ContentORM

# Default size (MB) per quality rung — plausible numbers for the UI badges.
_LADDER_MB = {"480p": 350, "720p": 950, "1080p": 2300, "4K": 8200}


def _quals(labels: list[str], audio: str = "Hindi-English") -> list[dict]:
    return [
        {"label": l, "size_mb": _LADDER_MB[l], "source_url": "", "audio": audio}
        for l in labels
    ]


# Titles from the curated set that should be series rather than films.
_SERIES_OVERRIDE = {
    "midnight-diner-99": "tv-series",
    "little-empires": "web-series",
    "the-understudy": "web-series",
}

_DEFAULT_LANGS = ["Hindi", "English"]
_DEFAULT_OTT = ["OTT Original"]


def _from_curated() -> list[ContentORM]:
    rows: list[ContentORM] = []
    for t in _SEED:
        ctype = _SERIES_OVERRIDE.get(t.id, "movie")
        labels = ["480p", "720p", "1080p"] + (["4K"] if t.rating >= 8.0 else [])
        rows.append(
            ContentORM(
                id=t.id,
                title=t.title,
                tagline=t.tagline,
                synopsis=t.synopsis,
                year=t.year,
                runtime_min=t.runtime_min,
                maturity=t.maturity,
                content_type=ctype,
                genres=list(t.genres),
                moods=list(t.moods),
                vibe_tags=list(t.vibe_tags),
                languages=list(_DEFAULT_LANGS),
                ott=list(_DEFAULT_OTT),
                badges=list(t.badges),
                gradient=list(t.gradient),
                qualities=_quals(labels),
                rating=t.rating,
                trending_score=t.trending_score,
                accent=t.accent,
                poster_url=None,
            )
        )
    return rows


# Additional originals to enrich the catalog (movies + series, varied genres).
# (id, title, tagline, synopsis, year, runtime, maturity, type, genres, moods,
#  vibes, rating, accent, gradient, badges, trending, qual_labels)
_EXTRA = [
    ("crown-of-ash", "Crown of Ash", "A throne built on lies burns brightest.",
     "Rival heirs scheme through a single brutal winter as their dying kingdom fractures into open war.",
     2025, 0, "TV-MA", "web-series", ["Drama", "Fantasy"], ["epic", "mind-bending"],
     ["royal", "intrigue", "war", "ensemble"], 8.8, "#C9A227", ["#3a2e06", "#C9A227", "#0A0A0A"],
     ["New Series", "Top 10"], 96.8, ["480p", "720p", "1080p", "4K"]),
    ("delhi-underground", "Delhi Underground", "Every deal has a deadline.",
     "A rookie cop and a street hacker chase a data heist through the neon arteries of midnight Delhi.",
     2024, 0, "TV-MA", "web-series", ["Crime", "Thriller"], ["adrenaline", "late-night"],
     ["heist", "desi-noir", "tech", "fast"], 8.4, "#FF5C00", ["#3a1500", "#FF5C00", "#0A0A0A"],
     ["Hindi Series"], 94.1, ["480p", "720p", "1080p", "4K"]),
    ("monsoon-letters", "Monsoon Letters", "The rain carries what we couldn't say.",
     "Across one drenched Mumbai monsoon, four strangers' lives braid together through misdelivered letters.",
     2023, 132, "PG", "movie", ["Romance", "Drama"], ["heartfelt", "comfort"],
     ["romance", "rain", "interwoven", "warm"], 8.1, "#FF7AB6", ["#4a0f33", "#FF7AB6", "#0A0A0A"],
     ["Critics' Pick"], 83.6, ["480p", "720p", "1080p"]),
    ("zero-gravity-blues", "Zero Gravity Blues", "In orbit, no one can hear you quit.",
     "A burnt-out jazz pianist takes a gig on a luxury space station and uncovers why the music never stops.",
     2025, 121, "PG-13", "movie", ["Sci-Fi", "Drama"], ["mind-bending", "late-night"],
     ["space", "music", "moody", "slow-burn"], 7.7, "#4DA8FF", ["#0a2a4a", "#4DA8FF", "#0A0A0A"],
     ["New"], 81.0, ["480p", "720p", "1080p", "4K"]),
    ("the-tiffin-club", "The Tiffin Club", "Lunch is served. So is justice.",
     "A retired chef rallies a neighbourhood of dabbawalas to take down a syndicate one delivery at a time.",
     2024, 0, "TV-14", "tv-series", ["Comedy", "Crime"], ["comfort", "adrenaline"],
     ["feel-good", "ensemble", "desi", "witty"], 8.0, "#9CE34D", ["#1f3a06", "#9CE34D", "#0A0A0A"],
     ["Fan Favorite"], 85.7, ["480p", "720p", "1080p"]),
    ("hollow-tide", "Hollow Tide", "The sea gives nothing back.",
     "A fishing town's children start dreaming the same drowning — and the tide keeps rising in their sleep.",
     2025, 109, "R", "movie", ["Horror", "Mystery"], ["late-night", "mind-bending"],
     ["folk-horror", "eerie", "dread", "twist"], 7.6, "#3DE0D0", ["#063a38", "#3DE0D0", "#0A0A0A"],
     ["New"], 84.0, ["480p", "720p", "1080p"]),
    ("api-fortune", "Fortune Engine", "Greed, automated.",
     "Quant traders build an AI that prints money — until it starts trading their lives against the market.",
     2024, 128, "TV-MA", "movie", ["Thriller", "Sci-Fi"], ["mind-bending", "adrenaline"],
     ["finance", "ai", "twisty", "slick"], 8.2, "#FFD24D", ["#403100", "#FFD24D", "#0A0A0A"],
     ["Top 10"], 90.9, ["480p", "720p", "1080p", "4K"]),
    ("saffron-skies", "Saffron Skies", "One festival. A thousand goodbyes.",
     "Three siblings return to their Rajasthan haveli for a final Diwali before it's sold, unearthing old wounds.",
     2023, 138, "PG", "movie", ["Drama"], ["heartfelt", "comfort", "epic"],
     ["family", "festival", "sweeping", "warm"], 8.3, "#FFB13D", ["#402800", "#FFB13D", "#0A0A0A"],
     ["Award Winner"], 86.2, ["480p", "720p", "1080p", "4K"]),
    ("circuit-breaker", "Circuit Breaker", "Win the race. Survive the pit.",
     "A privateer racing team bets everything on a banned engine and a driver with nothing left to lose.",
     2025, 124, "PG-13", "movie", ["Action", "Sports"], ["adrenaline", "epic"],
     ["racing", "high-stakes", "loud", "intense"], 7.8, "#E50914", ["#3a0a12", "#E50914", "#0A0A0A"],
     ["New", "Top 10"], 92.7, ["480p", "720p", "1080p", "4K"]),
    ("the-archive", "The Archive", "Some files were buried for a reason.",
     "A night-shift librarian discovers a basement of forbidden recordings that rewrite whoever listens.",
     2024, 0, "TV-MA", "web-series", ["Mystery", "Horror"], ["late-night", "mind-bending"],
     ["conspiracy", "uncanny", "slow-burn", "eerie"], 7.9, "#9B6BFF", ["#2a1a4a", "#9B6BFF", "#0A0A0A"],
     ["New Series"], 82.8, ["480p", "720p", "1080p"]),
    ("kabaddi-kings", "Kabaddi Kings", "One breath. One raid. One shot.",
     "A washed-up kabaddi captain trains a village underdog squad for the national league against all odds.",
     2024, 134, "U", "movie", ["Sports", "Drama"], ["adrenaline", "heartfelt", "comfort"],
     ["underdog", "desi", "rousing", "team"], 8.0, "#2EE6A6", ["#063a2c", "#2EE6A6", "#0A0A0A"],
     ["Fan Favorite"], 84.9, ["480p", "720p", "1080p"]),
    ("glass-monsoon", "Glass Monsoon", "Memory is a fragile season.",
     "An architect with early memory loss races to finish the house that holds her late wife's last design.",
     2025, 116, "PG-13", "movie", ["Drama", "Romance"], ["heartfelt", "mind-bending"],
     ["grief", "poetic", "quiet", "tender"], 8.5, "#E8A0FF", ["#37104a", "#E8A0FF", "#0A0A0A"],
     ["Critics' Pick"], 87.1, ["480p", "720p", "1080p", "4K"]),
    ("nightmarket", "Night Market", "Everything's for sale after dark.",
     "An anthology series roaming one ever-shifting night bazaar where each stall hides a stranger's fate.",
     2025, 0, "TV-MA", "tv-series", ["Fantasy", "Drama"], ["late-night", "mind-bending", "comfort"],
     ["anthology", "magical", "lush", "moody"], 8.1, "#C04DFF", ["#34064a", "#C04DFF", "#0A0A0A"],
     ["New Series"], 85.4, ["480p", "720p", "1080p", "4K"]),
    ("frostline", "Frostline", "The mountain decides who comes back.",
     "A rescue climber confronts the peak that killed her team when a billionaire's expedition goes silent.",
     2024, 119, "PG-13", "movie", ["Adventure", "Thriller"], ["epic", "adrenaline"],
     ["survival", "snow", "grit", "vast"], 7.9, "#7FE3FF", ["#0a3344", "#7FE3FF", "#0A0A0A"],
     ["Top 10"], 88.3, ["480p", "720p", "1080p", "4K"]),
]


def _from_extra() -> list[ContentORM]:
    rows: list[ContentORM] = []
    for (
        id_, title, tagline, synopsis, year, runtime, maturity, ctype,
        genres, moods, vibes, rating, accent, grad, badges, trending, labels,
    ) in _EXTRA:
        rows.append(
            ContentORM(
                id=id_, title=title, tagline=tagline, synopsis=synopsis, year=year,
                runtime_min=runtime, maturity=maturity, content_type=ctype,
                genres=genres, moods=moods, vibe_tags=vibes,
                languages=list(_DEFAULT_LANGS), ott=list(_DEFAULT_OTT), badges=badges,
                gradient=grad, qualities=_quals(labels), rating=rating,
                trending_score=trending, accent=accent, poster_url=None,
            )
        )
    return rows


def seed_if_empty(session: Session) -> int:
    """Insert the catalog when empty. Returns the number of rows inserted."""
    count = session.scalar(select(func.count()).select_from(ContentORM)) or 0
    if count:
        return 0
    rows = _from_curated() + _from_extra()
    session.add_all(rows)
    session.commit()
    return len(rows)
