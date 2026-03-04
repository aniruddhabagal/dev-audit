"""Pydantic schemas for auth-related requests and responses."""

from __future__ import annotations

from pydantic import BaseModel


class Token(BaseModel):
    """JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class GitHubOAuthURL(BaseModel):
    """GitHub OAuth redirect URL."""

    url: str
