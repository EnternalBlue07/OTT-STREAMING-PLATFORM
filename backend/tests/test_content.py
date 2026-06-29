"""Tests for the Phase 1 content/catalog endpoints."""
from __future__ import annotations


def _assert_envelope(body: dict) -> None:
    assert set(body.keys()) == {"data", "error", "meta"}
    assert (body["data"] is None) != (body["error"] is None)


def test_home_payload(client):
    resp = client.get("/api/v1/content/home")
    assert resp.status_code == 200
    body = resp.json()
    _assert_envelope(body)
    data = body["data"]
    assert "spotlight" in data and "rails" in data and "moods" in data
    assert data["rails"][0]["key"] == "trending"
    assert len(data["rails"][0]["items"]) > 0
    # Cards carry the ambient accent + a match score.
    card = data["rails"][0]["items"][0]
    assert card["accent"].startswith("#")
    assert 60 <= card["match"] <= 99


def test_trending_sorted_desc(client):
    resp = client.get("/api/v1/content/trending?limit=5")
    items = resp.json()["data"]
    assert resp.status_code == 200
    assert len(items) == 5


def test_mood_filter_and_unknown_mood(client):
    ok_resp = client.get("/api/v1/content/mood/late-night")
    assert ok_resp.status_code == 200
    assert all("late-night" in c["moods"] for c in ok_resp.json()["data"])

    bad = client.get("/api/v1/content/mood/not-a-mood")
    assert bad.status_code == 404
    assert bad.json()["error"]["code"] == "NOT_FOUND"


def test_detail_and_similar(client):
    detail = client.get("/api/v1/content/signal-horizon")
    assert detail.status_code == 200
    assert detail.json()["data"]["synopsis"]

    sim = client.get("/api/v1/content/signal-horizon/similar")
    assert sim.status_code == 200
    ids = {c["id"] for c in sim.json()["data"]}
    assert "signal-horizon" not in ids  # never recommends itself


def test_search(client):
    resp = client.get("/api/v1/content/search?q=heist")
    assert resp.status_code == 200
    body = resp.json()
    assert body["meta"]["query"] == "heist"
    assert body["meta"]["count"] == len(body["data"])


def test_taste_dna(client):
    resp = client.get("/api/v1/content/taste-dna")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["top_genre"]
    assert all(0 <= p["affinity"] <= 1 for p in data["profile"])
