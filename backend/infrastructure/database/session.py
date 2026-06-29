"""SQLAlchemy engine/session setup.

SQLite by default (zero install); set ``DATABASE_URL`` to a Postgres URL for
production. The engine is created lazily so importing this module never fails.
"""
from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from infrastructure.config import get_settings


class Base(DeclarativeBase):
    """Declarative base for future ORM models (Phase 0 keeps this minimal)."""


def _make_engine():
    settings = get_settings()
    url = settings.database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True, future=True)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def init_db() -> None:
    """Create tables for any registered models. Safe to call at startup."""
    Base.metadata.create_all(bind=engine)


def ping_database() -> bool:
    """Return True if the database answers a trivial query."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
