"""
GitHub OAuth authentication endpoints.

Flow:
1. Frontend redirects user to GET /auth/github  → returns OAuth URL
2. GitHub redirects back with `code` query param
3. Frontend posts code to GET /auth/github/callback → returns JWT
4. GET /auth/me → returns current user profile (requires JWT)
"""

from __future__ import annotations

from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import GitHubOAuthURL, Token
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/github", response_model=GitHubOAuthURL)
async def github_oauth_url():
    """Return the GitHub OAuth authorization URL."""
    settings = get_settings()
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "read:user user:email repo",
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return GitHubOAuthURL(url=url)


@router.get("/github/callback", response_model=Token)
async def github_oauth_callback(code: str):
    """
    Exchange the GitHub OAuth code for an access token,
    upsert the user in MongoDB, and return a JWT.
    """
    settings = get_settings()

    # 1. Exchange code for GitHub access token
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )

    if token_resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to exchange code with GitHub",
        )

    token_data = token_resp.json()
    github_access_token = token_data.get("access_token")
    if not github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=token_data.get("error_description", "Invalid code"),
        )

    # 2. Get GitHub user profile
    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

    if user_resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch GitHub user profile",
        )

    gh_user = user_resp.json()

    # 3. Upsert user in MongoDB
    user = await User.find_one(User.github_id == gh_user["id"])
    if user is None:
        user = User(
            github_id=gh_user["id"],
            username=gh_user["login"],
            email=gh_user.get("email"),
            avatar_url=gh_user.get("avatar_url"),
            github_access_token=github_access_token,
        )
        await user.insert()
    else:
        # Update token + profile on each login
        user.github_access_token = github_access_token
        user.username = gh_user["login"]
        user.email = gh_user.get("email")
        user.avatar_url = gh_user.get("avatar_url")
        await user.save()

    # 4. Issue our own JWT
    jwt_token = create_access_token(data={"sub": str(user.github_id)})
    return Token(access_token=jwt_token)


@router.post("/token-exchange", response_model=Token)
async def token_exchange(body: dict):
    """
    Exchange a GitHub access token for a DevAudit JWT.

    Used by NextAuth: after GitHub OAuth, NextAuth already has the
    access_token. This endpoint validates it against GitHub's API,
    upserts the user, and returns our own JWT.

    Body: { "github_access_token": "gho_xxxx..." }
    """
    github_access_token = body.get("github_access_token")
    if not github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="github_access_token is required",
        )

    # 1. Validate the token by fetching the GitHub user profile
    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

    if user_resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub access token",
        )

    gh_user = user_resp.json()

    # 2. Upsert user in MongoDB
    user = await User.find_one(User.github_id == gh_user["id"])
    if user is None:
        user = User(
            github_id=gh_user["id"],
            username=gh_user["login"],
            email=gh_user.get("email"),
            avatar_url=gh_user.get("avatar_url"),
            github_access_token=github_access_token,
        )
        await user.insert()
    else:
        user.github_access_token = github_access_token
        user.username = gh_user["login"]
        user.email = gh_user.get("email")
        user.avatar_url = gh_user.get("avatar_url")
        await user.save()

    # 3. Issue our own JWT
    jwt_token = create_access_token(data={"sub": str(user.github_id)})
    return Token(access_token=jwt_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserResponse(
        id=str(current_user.id),
        github_id=current_user.github_id,
        username=current_user.username,
        email=current_user.email,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
    )

