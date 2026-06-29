"""Pytest fixtures: configure an isolated SQLite DB and a TestClient."""
from __future__ import annotations

import os

# Force a throwaway SQLite DB and no Redis before app import.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_phase0.sqlite3")
os.environ.setdefault("REDIS_URL", "")
os.environ.setdefault("APP_ENV", "local")
os.environ.setdefault("LOG_JSON", "false")

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    with TestClient(app) as c:
        yield c
