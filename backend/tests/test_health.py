"""Smoke tests for health, readiness, metrics, and the response envelope."""
from __future__ import annotations


def _assert_envelope(body: dict) -> None:
    assert set(body.keys()) == {"data", "error", "meta"}
    # Exactly one of data/error is populated.
    assert (body["data"] is None) != (body["error"] is None)


def test_health_returns_200_and_envelope(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    _assert_envelope(body)
    assert body["data"]["status"] == "ok"


def test_health_has_request_id_header(client):
    resp = client.get("/api/v1/health")
    assert resp.headers.get("X-Request-ID")


def test_readiness_reports_dependencies(client):
    resp = client.get("/api/v1/readiness")
    assert resp.status_code == 200  # SQLite is always reachable
    body = resp.json()
    _assert_envelope(body)
    names = {d["name"] for d in body["data"]["dependencies"]}
    assert {"database", "redis"} <= names
    assert body["data"]["status"] == "ready"


def test_metrics_exposition(client):
    resp = client.get("/metrics")
    assert resp.status_code == 200
    assert "http_requests_total" in resp.text


def test_security_headers_present(client):
    resp = client.get("/api/v1/health")
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert "Content-Security-Policy" in resp.headers
