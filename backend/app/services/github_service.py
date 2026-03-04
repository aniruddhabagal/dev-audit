"""
GitHub service – repo metadata fetching and access validation.

Uses httpx async client against the GitHub REST API.
"""

from __future__ import annotations

import re
from typing import Any

import httpx
from loguru import logger


def parse_repo_owner_name(repo_url: str) -> tuple[str, str]:
    """Extract (owner, repo_name) from a GitHub URL."""
    # Handles https://github.com/owner/repo, https://github.com/owner/repo.git, etc.
    match = re.search(r"github\.com/([^/]+)/([^/.]+)", repo_url)
    if not match:
        raise ValueError(f"Cannot parse GitHub repo from URL: {repo_url}")
    return match.group(1), match.group(2)


async def get_repo_metadata(
    repo_url: str,
    access_token: str,
) -> dict[str, Any]:
    """
    Fetch repository metadata from the GitHub API.

    Returns dict with: name, full_name, default_branch, language, languages dict,
    description, private, etc.
    """
    owner, repo = parse_repo_owner_name(repo_url)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

    if resp.status_code == 404:
        raise ValueError(f"Repository not found or no access: {owner}/{repo}")
    resp.raise_for_status()

    data = resp.json()

    # Also fetch language breakdown
    async with httpx.AsyncClient() as client:
        lang_resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/languages",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )

    languages = lang_resp.json() if lang_resp.status_code == 200 else {}

    logger.info(f"Fetched metadata for {owner}/{repo}: {data.get('language', 'N/A')}")

    return {
        "name": data["name"],
        "full_name": data["full_name"],
        "default_branch": data["default_branch"],
        "language": data.get("language"),
        "languages": languages,
        "description": data.get("description"),
        "private": data["private"],
    }


async def validate_repo_access(repo_url: str, access_token: str) -> bool:
    """Check whether the token grants read access to the repository."""
    try:
        await get_repo_metadata(repo_url, access_token)
        return True
    except (ValueError, httpx.HTTPStatusError):
        return False
