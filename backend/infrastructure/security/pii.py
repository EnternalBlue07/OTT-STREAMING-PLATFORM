"""PII masking helpers.

Used by the logging layer so personal data (emails, tokens, etc.) is never
written to logs in clear text.
"""
from __future__ import annotations

import re
from typing import Any

_EMAIL_RE = re.compile(r"([A-Za-z0-9._%+-])([A-Za-z0-9._%+-]*)(@[^\s]+)")

# Keys whose values should always be redacted entirely.
_SENSITIVE_KEYS = {
    "password",
    "passwd",
    "secret",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "set-cookie",
    "api_key",
    "client_secret",
}


def mask_email(value: str) -> str:
    """Mask an email: ``john.doe@example.com`` -> ``j***@example.com``."""

    def _repl(m: re.Match[str]) -> str:
        return f"{m.group(1)}***{m.group(3)}"

    return _EMAIL_RE.sub(_repl, value)


def _mask_value(key: str, value: Any) -> Any:
    if isinstance(value, str):
        if key.lower() in _SENSITIVE_KEYS:
            return "***REDACTED***"
        return mask_email(value)
    return value


def mask_pii(data: Any) -> Any:
    """Recursively mask PII in dicts/lists/strings for safe logging."""
    if isinstance(data, dict):
        return {k: (_mask_value(k, v) if not isinstance(v, (dict, list)) else mask_pii(v)) for k, v in data.items()}
    if isinstance(data, list):
        return [mask_pii(v) for v in data]
    if isinstance(data, str):
        return mask_email(data)
    return data
