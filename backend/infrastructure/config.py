"""Typed application settings loaded from the environment.

This is the single source of truth for backend configuration. Nothing else
should read ``os.environ`` directly.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # App
    app_env: str = "local"
    app_name: str = "ott-backend"
    api_v1_prefix: str = "/api/v1"
    backend_port: int = 8001

    # Database
    database_url: str = "sqlite:///./ott_phase0.sqlite3"

    # Redis (optional)
    redis_url: str = ""

    # CORS
    cors_allow_origins: str = "*"

    # Auth verification (Better Auth lives in the Next.js layer)
    better_auth_url: str = "http://localhost:3000"
    better_auth_verify_path: str = "/api/auth/get-session"
    session_verify_cache_ttl_seconds: int = 10

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    # Media storage (local filesystem; replaces MinIO/S3 for no-Docker dev)
    media_dir: str = "media"
    public_base_url: str = "http://localhost:8001"

    # Observability
    log_level: str = "INFO"
    log_json: bool = True
    sentry_dsn: str = ""
    otel_exporter_otlp_endpoint: str = ""
    otel_service_name: str = "ott-backend"

    # --- Derived helpers ---
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def redis_enabled(self) -> bool:
        return bool(self.redis_url.strip())

    @property
    def session_verify_url(self) -> str:
        return f"{self.better_auth_url.rstrip('/')}{self.better_auth_verify_path}"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
