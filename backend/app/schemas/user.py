"""Pydantic schemas for user-related responses."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserResponse(BaseModel):
    """Public user profile returned by the API."""

    id: str
    github_id: int
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
