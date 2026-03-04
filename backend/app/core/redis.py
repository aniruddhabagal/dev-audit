"""
Async Redis client factory.

Used for caching and (later) Pub/Sub streaming of agent findings.
"""

from __future__ import annotations

import redis.asyncio as aioredis

from app.core.config import get_settings

_redis: aioredis.Redis | None = None


async def init_redis() -> None:
    """Create the async Redis connection pool."""
    global _redis
    settings = get_settings()
    _redis = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
    )
    # Verify connectivity
    await _redis.ping()


async def close_redis() -> None:
    """Gracefully close the Redis connection pool."""
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def get_redis() -> aioredis.Redis:
    """Return the current Redis client (for dependency injection)."""
    if _redis is None:
        raise RuntimeError("Redis not initialised – call init_redis() first")
    return _redis
