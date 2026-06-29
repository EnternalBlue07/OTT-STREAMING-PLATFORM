"""Cache abstraction with a Redis backend and an in-memory dev fallback.

Used for rate limiting and short-TTL session-verification caching. When
``REDIS_URL`` is empty the in-memory implementation is used so the app boots
without Redis installed.
"""
from __future__ import annotations

import threading
import time
from typing import Protocol

from infrastructure.config import get_settings


class CacheBackend(Protocol):
    def incr_with_ttl(self, key: str, ttl_seconds: int) -> int: ...
    def get(self, key: str) -> str | None: ...
    def set(self, key: str, value: str, ttl_seconds: int) -> None: ...
    def ping(self) -> bool: ...


class InMemoryCache:
    """Thread-safe in-memory cache. Dev/test only — not shared across processes."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._counters: dict[str, tuple[int, float]] = {}  # key -> (count, expires_at)
        self._values: dict[str, tuple[str, float]] = {}    # key -> (value, expires_at)

    def incr_with_ttl(self, key: str, ttl_seconds: int) -> int:
        now = time.monotonic()
        with self._lock:
            count, expires = self._counters.get(key, (0, 0.0))
            if now >= expires:
                count, expires = 0, now + ttl_seconds
            count += 1
            self._counters[key] = (count, expires)
            return count

    def get(self, key: str) -> str | None:
        now = time.monotonic()
        with self._lock:
            entry = self._values.get(key)
            if not entry:
                return None
            value, expires = entry
            if now >= expires:
                self._values.pop(key, None)
                return None
            return value

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        with self._lock:
            self._values[key] = (value, time.monotonic() + ttl_seconds)

    def ping(self) -> bool:
        return True


class RedisCache:
    """Redis-backed cache used when REDIS_URL is configured."""

    def __init__(self, url: str) -> None:
        import redis

        self._client = redis.Redis.from_url(url, decode_responses=True)

    def incr_with_ttl(self, key: str, ttl_seconds: int) -> int:
        pipe = self._client.pipeline()
        pipe.incr(key)
        pipe.expire(key, ttl_seconds, nx=True)
        count, _ = pipe.execute()
        return int(count)

    def get(self, key: str) -> str | None:
        return self._client.get(key)

    def set(self, key: str, value: str, ttl_seconds: int) -> None:
        self._client.set(key, value, ex=ttl_seconds)

    def ping(self) -> bool:
        try:
            return bool(self._client.ping())
        except Exception:
            return False


_cache: CacheBackend | None = None


def get_cache() -> CacheBackend:
    """Return the process-wide cache backend (Redis if configured, else memory)."""
    global _cache
    if _cache is None:
        settings = get_settings()
        if settings.redis_enabled:
            try:
                _cache = RedisCache(settings.redis_url)
            except Exception:
                _cache = InMemoryCache()
        else:
            _cache = InMemoryCache()
    return _cache


def cache_is_redis() -> bool:
    return isinstance(get_cache(), RedisCache)
