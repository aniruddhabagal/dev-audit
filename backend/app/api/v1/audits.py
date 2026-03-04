"""
Audit CRUD + start endpoints.

POST /audits/start  — kick off a new audit
GET  /audits        — list user's audits (paginated)
GET  /audits/{id}   — get full audit details
"""

from __future__ import annotations

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user
from app.models.audit import Audit
from app.models.user import User
from app.schemas.audit import AuditCreate, AuditListItem, AuditResponse
from app.services.audit_service import start_audit

router = APIRouter(prefix="/audits", tags=["audits"])


@router.post("/start", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(
    body: AuditCreate,
    current_user: User = Depends(get_current_user),
):
    """Start a new codebase audit for the given repo URL."""
    audit = await start_audit(user=current_user, repo_url=str(body.repo_url))

    return _audit_to_response(audit)


@router.get("/", response_model=list[AuditListItem])
async def list_audits(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """List the current user's audits (newest first)."""
    audits = (
        await Audit.find(Audit.user_id == current_user.id)
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    return [
        AuditListItem(
            id=str(a.id),
            repo_url=a.repo_url,
            repo_name=a.repo_name,
            status=a.status,
            overall_score=a.overall_score,
            issues_count=len(a.issues),
            created_at=a.created_at,
        )
        for a in audits
    ]


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: str,
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single audit with all issues and fix PRs."""
    try:
        oid = PydanticObjectId(audit_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audit ID")

    audit = await Audit.get(oid)
    if audit is None or audit.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")

    return _audit_to_response(audit)


# ── helpers ──────────────────────────────────────────────────


def _audit_to_response(audit: Audit) -> AuditResponse:
    return AuditResponse(
        id=str(audit.id),
        user_id=str(audit.user_id),
        repo_url=audit.repo_url,
        repo_name=audit.repo_name,
        status=audit.status,
        overall_score=audit.overall_score,
        agent_runs=audit.agent_runs,
        issues=audit.issues,
        fix_prs=audit.fix_prs,
        started_at=audit.started_at,
        completed_at=audit.completed_at,
        created_at=audit.created_at,
    )
