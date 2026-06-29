"""Domain exception hierarchy.

Every exception carries a stable ``code``, a human ``message``, and an HTTP
``status`` so the interface layer can map it to the standard error envelope
without leaking internals.
"""
from __future__ import annotations


class DomainException(Exception):
    """Base for all expected, mappable domain errors."""

    code: str = "DOMAIN_ERROR"
    status: int = 400

    def __init__(self, message: str, *, code: str | None = None, status: int | None = None) -> None:
        super().__init__(message)
        self.message = message
        if code is not None:
            self.code = code
        if status is not None:
            self.status = status


class UnauthorizedError(DomainException):
    code = "UNAUTHORIZED"
    status = 401

    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message)


class ForbiddenError(DomainException):
    code = "FORBIDDEN"
    status = 403

    def __init__(self, message: str = "You do not have access to this resource") -> None:
        super().__init__(message)


class ValidationError(DomainException):
    code = "VALIDATION_ERROR"
    status = 422

    def __init__(self, message: str = "Invalid input") -> None:
        super().__init__(message)


class RateLimitedError(DomainException):
    code = "RATE_LIMITED"
    status = 429

    def __init__(self, message: str = "Too many requests") -> None:
        super().__init__(message)


class UpstreamAuthError(DomainException):
    """Raised when the Better Auth service cannot be reached for verification."""

    code = "UPSTREAM_AUTH_UNAVAILABLE"
    status = 502

    def __init__(self, message: str = "Authentication service unavailable") -> None:
        super().__init__(message)
