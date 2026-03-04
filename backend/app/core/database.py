"""
Motor (async MongoDB driver) + Beanie ODM initialisation.

Call `init_db()` during FastAPI lifespan startup.
"""

from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import get_settings
from app.models.user import User
from app.models.audit import Audit

# All Beanie Document classes must be listed here so indexes are created.
DOCUMENT_MODELS = [User, Audit]

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    """Connect to MongoDB and initialise Beanie document models."""
    global _client
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=_client[settings.MONGODB_DB_NAME],
        document_models=DOCUMENT_MODELS,
    )


async def close_db() -> None:
    """Close the Motor client connection pool."""
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_client() -> AsyncIOMotorClient:
    """Return the current Motor client (for health-checks etc.)."""
    if _client is None:
        raise RuntimeError("Database not initialised – call init_db() first")
    return _client
