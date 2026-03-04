"""
User Beanie Document model.

Represents a GitHub-authenticated user stored in the `users` collection.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pymongo import IndexModel


class User(Document):
    """A DevAudit user (authenticated via GitHub OAuth)."""

    github_id: int
    username: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    github_access_token: str  # used for private repo access + opening PRs
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("github_id", 1)], unique=True),
        ]
