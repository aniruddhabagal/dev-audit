"""Pydantic schemas for audit-related requests and responses."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl

from app.models.audit import AuditStatus, AgentRun, Issue, FixPR


class AuditCreate(BaseModel):
    """Request body for starting a new audit."""

    repo_url: HttpUrl


class AuditResponse(BaseModel):
    """Full audit record returned by the API."""

    id: str
    user_id: str
    repo_url: str
    repo_name: str
    status: AuditStatus
    overall_score: Optional[float] = None

    agent_runs: list[AgentRun] = []
    issues: list[Issue] = []
    fix_prs: list[FixPR] = []

    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class AuditListItem(BaseModel):
    """Lightweight audit summary for listing pages."""

    id: str
    repo_url: str
    repo_name: str
    status: AuditStatus
    overall_score: Optional[float] = None
    issues_count: int = 0
    created_at: datetime
