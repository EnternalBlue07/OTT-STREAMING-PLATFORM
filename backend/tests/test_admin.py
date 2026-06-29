"""Tests for the admin authoring endpoints (create / poster / list / delete)."""
from __future__ import annotations

import io


def test_create_list_poster_delete(client):
    payload = {
        "title": "Test Upload Title",
        "content_type": "web-series",
        "tagline": "A test.",
        "synopsis": "Created in a test.",
        "year": 2025,
        "runtime_min": 50,
        "maturity": "TV-MA",
        "rating": 7.5,
        "accent": "#22D3EE",
        "genres": ["Drama"],
        "moods": ["late-night"],
        "languages": ["English", "Hindi"],
        "ott": ["OTToriginals"],
        "qualities": [{"label": "1080p", "size_mb": 1200}, {"label": "4K", "size_mb": 4000}],
    }
    created = client.post("/api/v1/admin/content", json=payload)
    assert created.status_code == 200
    cid = created.json()["data"]["id"]
    assert created.json()["data"]["content_type"] == "web-series"

    # Appears in admin list
    listed = client.get("/api/v1/admin/content")
    assert any(c["id"] == cid for c in listed.json()["data"])

    # Appears in public catalog by type
    by_type = client.get("/api/v1/content/type/web-series")
    assert any(c["id"] == cid for c in by_type.json()["data"])

    # Upload a poster (tiny fake PNG)
    files = {"file": ("poster.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"0" * 64), "image/png")}
    poster = client.post(f"/api/v1/admin/content/{cid}/poster", files=files)
    assert poster.status_code == 200
    assert poster.json()["data"]["poster_url"].endswith((".png", ".jpg", ".webp", ".avif"))

    # Delete
    deleted = client.delete(f"/api/v1/admin/content/{cid}")
    assert deleted.status_code == 200
    assert client.get(f"/api/v1/content/{cid}").status_code == 404


def test_create_validation(client):
    bad = client.post("/api/v1/admin/content", json={"title": ""})
    assert bad.status_code == 422
