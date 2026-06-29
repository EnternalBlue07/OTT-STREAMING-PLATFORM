"""Tests for the reviews endpoints (breakdown, sort, voting)."""
from __future__ import annotations


def test_reviews_breakdown_and_items(client):
    resp = client.get("/api/v1/content/signal-horizon/reviews")
    assert resp.status_code == 200
    data = resp.json()["data"]
    bd = data["breakdown"]
    assert set(bd["counts"].keys()) == {"1", "2", "3", "4", "5"}
    assert bd["total"] == len(data["items"])
    assert 0 <= bd["average"] <= 5
    assert len(data["items"]) > 0
    item = data["items"][0]
    assert {"id", "author", "rating", "body", "has_spoilers", "verified", "helpful", "not_helpful"} <= set(item)


def test_reviews_sort_critical_vs_positive(client):
    crit = client.get("/api/v1/content/signal-horizon/reviews?sort=critical").json()["data"]["items"]
    pos = client.get("/api/v1/content/signal-horizon/reviews?sort=positive").json()["data"]["items"]
    if len(crit) >= 2:
        assert crit[0]["rating"] <= crit[-1]["rating"]   # ascending
        assert pos[0]["rating"] >= pos[-1]["rating"]     # descending


def test_review_vote_increments(client):
    items = client.get("/api/v1/content/signal-horizon/reviews").json()["data"]["items"]
    rid = items[0]["id"]
    before = items[0]["helpful"]
    voted = client.post(f"/api/v1/content/signal-horizon/reviews/{rid}/vote", json={"helpful": True})
    assert voted.status_code == 200
    assert voted.json()["data"]["helpful"] == before + 1


def test_review_vote_unknown_id_404(client):
    bad = client.post("/api/v1/content/signal-horizon/reviews/does-not-exist/vote", json={"helpful": True})
    assert bad.status_code == 404
    assert bad.json()["error"]["code"] == "NOT_FOUND"
