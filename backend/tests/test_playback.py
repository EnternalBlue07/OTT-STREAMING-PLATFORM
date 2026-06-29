"""Tests for the playback endpoint (movie + episode, 404)."""
from __future__ import annotations


def test_movie_playback_shape(client):
    resp = client.get("/api/v1/content/signal-horizon/playback")
    assert resp.status_code == 200
    d = resp.json()["data"]
    assert d["hls_url"]
    assert isinstance(d["renditions"], list) and len(d["renditions"]) >= 1
    assert {"label", "height", "bitrate"} <= set(d["renditions"][0])
    assert "skip_markers" in d and "intro" in d["skip_markers"]
    assert d["next_episode_id"] is None


def test_episode_playback_has_next(client):
    eps = client.get("/api/v1/content/crown-of-ash/episodes").json()["data"]["seasons"][0]["episodes"]
    first = eps[0]["id"]
    resp = client.get(f"/api/v1/content/crown-of-ash/playback?ep={first}")
    assert resp.status_code == 200
    d = resp.json()["data"]
    assert d["hls_url"]
    assert d["next_episode_id"] == eps[1]["id"]
    # Last episode has no next
    last = eps[-1]["id"]
    last_pb = client.get(f"/api/v1/content/crown-of-ash/playback?ep={last}").json()["data"]
    assert last_pb["next_episode_id"] is None


def test_playback_unknown_title_404(client):
    bad = client.get("/api/v1/content/nope/playback")
    assert bad.status_code == 404
    assert bad.json()["error"]["code"] == "NOT_FOUND"
