"""
DevAudit FastAPI application entry point.

Lifespan:
  - Startup:  Connect to MongoDB (Motor + Beanie), ping Redis.
  - Shutdown: Close MongoDB and Redis connections.

Routes:
  - GET  /health        → system health check
  - /api/v1/*           → versioned API (auth, audits)
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.core.redis import init_redis, close_redis
from app.api.v1.router import router as v1_router


# ── Lifespan ─────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle hooks."""
    settings = get_settings()

    # Startup
    logger.info("🚀 Starting DevAudit backend …")
    await init_db()
    logger.info("✅ MongoDB connected")

    try:
        await init_redis()
        logger.info("✅ Redis connected")
    except Exception as exc:
        logger.warning(f"⚠️  Redis unavailable (non-fatal): {exc}")

    yield

    # Shutdown
    logger.info("🛑 Shutting down …")
    await close_redis()
    await close_db()


# ── App ──────────────────────────────────────────────────────


app = FastAPI(
    title="DevAudit API",
    description="Multi-agent AI-powered codebase auditing platform",
    version="0.1.0",
    lifespan=lifespan,
)


# ── Middleware ───────────────────────────────────────────────


settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception handlers ──────────────────────────────────────


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ── Routes ───────────────────────────────────────────────────


@app.get("/health", tags=["system"])
async def health_check():
    """Liveness / readiness probe."""
    return {"status": "ok"}


app.include_router(v1_router, prefix="/api/v1")
