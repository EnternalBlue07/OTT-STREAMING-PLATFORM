"""Centralized exception handling -> standard error envelope."""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from domain.exceptions import DomainException
from interface.schemas import err

logger = logging.getLogger("error")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainException)
    async def _domain_exc(request: Request, exc: DomainException) -> JSONResponse:  # noqa: ARG001
        return JSONResponse(status_code=exc.status, content=err(exc.code, exc.message, exc.status))

    @app.exception_handler(RequestValidationError)
    async def _validation_exc(request: Request, exc: RequestValidationError) -> JSONResponse:  # noqa: ARG001
        return JSONResponse(
            status_code=422,
            content=err("VALIDATION_ERROR", "Invalid request input", 422, meta={"details": exc.errors()}),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_exc(request: Request, exc: StarletteHTTPException) -> JSONResponse:  # noqa: ARG001
        code = {401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 429: "RATE_LIMITED"}.get(
            exc.status_code, "HTTP_ERROR"
        )
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed"
        return JSONResponse(status_code=exc.status_code, content=err(code, detail, exc.status_code))

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:  # noqa: ARG001
        # Never leak internals; details go to logs/Sentry only.
        logger.exception("Unhandled exception")
        return JSONResponse(
            status_code=500,
            content=err("INTERNAL_ERROR", "An unexpected error occurred", 500),
        )
