"""Unit tests for PII masking."""
from __future__ import annotations

from infrastructure.security.pii import mask_email, mask_pii


def test_mask_email():
    assert mask_email("john.doe@example.com") == "j***@example.com"


def test_mask_pii_redacts_sensitive_keys():
    masked = mask_pii({"password": "secret", "email": "a@b.com", "n": 1})
    assert masked["password"] == "***REDACTED***"
    assert masked["email"] == "a***@b.com"
    assert masked["n"] == 1


def test_mask_pii_nested():
    masked = mask_pii({"user": {"email": "x.y@z.com", "token": "abc"}})
    assert masked["user"]["email"] == "x***@z.com"
    assert masked["user"]["token"] == "***REDACTED***"
