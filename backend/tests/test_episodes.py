"""Tests for the episodes endpoint (series vs movie)."""
from __future__ import annotations


def test_series_has_seasons_and_episodes(client):
    resp = client.get("/api/v1/content/crown-of-ash/episodes")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["content_type"] in ("web-series", "tv-series")
    assert len(data["seasons"]) >= 1
    eps = data["seasons"][0]["episodes"]
    assert len(eps) == 6
    # Ordered by episode number
    assert [e["episode"] for e in eps] == sorted(e["episode"] for e in eps)
    assert {"id", "title", "synopsis", "runtime_min", "watched"} <= set(eps[0])


def test_movie_has_no_seasons(client):
    resp = client.get("/api/v1/content/signal-horizon/episodes")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["content_type"] == "movie"
    assert data["seasons"] == []
