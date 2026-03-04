"""
v1 aggregate router – mounts all sub-routers under /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.audits import router as audits_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(audits_router)
