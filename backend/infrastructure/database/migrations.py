"""Lightweight additive schema migrations (no Alembic).

SQLite supports additive ``ALTER TABLE ... ADD COLUMN`` cheaply. Phase 2 adds
several JSON/TEXT columns to the existing ``content`` table without dropping
data (admin-uploaded titles survive). This runs at startup, is idempotent, and
only adds columns that are missing.

Only additive changes are supported. When Postgres lands, switch to a real
migration tool.
"""
from __future__ import annotations

from sqlalchemy import Engine, text

from infrastructure.observability.logging import get_logger

_log = get_logger("migrations")

# Columns introduced in Phase 2, with SQLite-compatible type + default.
# JSON is stored as TEXT in SQLite; SQLAlchemy's JSON type reads/writes it.
_CONTENT_COLUMNS: dict[str, str] = {
    "trailers": "TEXT DEFAULT '[]'",
    "cast": "TEXT DEFAULT '[]'",
    "content_info": "TEXT DEFAULT '{}'",
    "hls_url": "TEXT",
    "audio_tracks": "TEXT DEFAULT '[]'",
    "subtitle_tracks": "TEXT DEFAULT '[]'",
    "skip_markers": "TEXT DEFAULT '{}'",
}


def _existing_columns(conn, table: str) -> set[str]:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return {r[1] for r in rows}  # r[1] = column name


def ensure_content_columns(engine: Engine) -> list[str]:
    """Add any missing Phase-2 columns to ``content``. Returns columns added.

    Safe to call repeatedly. If the ``content`` table does not yet exist
    (fresh DB before ``create_all``), this is a no-op — ``create_all`` will
    create it with the full ORM definition.
    """
    added: list[str] = []
    with engine.begin() as conn:
        tables = {
            r[0]
            for r in conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            ).fetchall()
        }
        if "content" not in tables:
            return added

        have = _existing_columns(conn, "content")
        for name, decl in _CONTENT_COLUMNS.items():
            if name not in have:
                conn.execute(text(f"ALTER TABLE content ADD COLUMN {name} {decl}"))
                added.append(name)

    if added:
        _log.info("Added content columns: %s", ", ".join(added))
    return added
