"""Sentry initialization placeholder. Inert unless SENTRY_DSN is configured."""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def init_sentry(dsn: str, environment: str) -> None:
    if not dsn:
        logger.info("Sentry disabled (no DSN configured).")
        return
    try:
        import sentry_sdk

        sentry_sdk.init(
            dsn=dsn,
            environment=environment,
            traces_sample_rate=0.1,
            send_default_pii=False,  # never forward PII
        )
        logger.info("Sentry initialized.")
    except Exception as exc:  # pragma: no cover
        logger.warning("Sentry init failed: %s", exc)
