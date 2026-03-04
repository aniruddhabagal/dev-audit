"""
Audit service – create audit records and (later) dispatch to agent orchestrator.

Week 1: Creates the Audit document with status=PENDING.
Week 2: Will dispatch to LangGraph agent orchestrator for actual analysis.
"""

from __future__ import annotations

from datetime import datetime, timezone

from loguru import logger

from app.models.audit import Audit, AuditStatus
from app.models.user import User
from app.services.github_service import get_repo_metadata, parse_repo_owner_name


async def start_audit(user: User, repo_url: str) -> Audit:
    """
    Validate the repo, create an Audit document, and return it.

    In Week 2 this function will also kick off the LangGraph orchestrator
    as a background task.
    """
    # 1. Parse and validate
    owner, repo_name = parse_repo_owner_name(repo_url)

    # 2. Fetch repo metadata (also validates access)
    metadata = await get_repo_metadata(repo_url, user.github_access_token)

    logger.info(
        f"Starting audit for {metadata['full_name']} "
        f"(branch: {metadata['default_branch']}, lang: {metadata.get('language')})"
    )

    # 3. Create audit document
    audit = Audit(
        user_id=user.id,
        repo_url=repo_url,
        repo_name=metadata["full_name"],
        status=AuditStatus.PENDING,
        created_at=datetime.now(timezone.utc),
    )
    await audit.insert()

    logger.info(f"Audit {audit.id} created for {repo_url}")

    # TODO (Week 2): Dispatch to LangGraph agent orchestrator
    # await dispatch_agents(audit)

    return audit
