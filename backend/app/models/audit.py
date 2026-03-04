"""
Audit Beanie Document model with embedded AgentRun, Issue, and FixPR.

Represents a single codebase audit stored in the `audits` collection.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from beanie import PydanticObjectId
from pydantic import BaseModel
from pymongo import IndexModel


# ── Enums ────────────────────────────────────────────────────


class AuditStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ── Embedded models (not top-level Documents) ────────────────


class AgentRun(BaseModel):
    """Tracks the lifecycle of a single agent execution."""

    agent_name: str
    status: str = "pending"
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    findings_count: int = 0


class Issue(BaseModel):
    """A single finding discovered by an agent."""

    agent: str
    severity: Severity = Severity.MEDIUM
    title: str
    description: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    suggestion: Optional[str] = None


class FixPR(BaseModel):
    """Tracks a GitHub PR opened by the Fix Agent."""

    issue_index: int
    pr_url: str
    pr_number: int
    status: str = "open"  # open | merged | closed


# ── Top-level Document ───────────────────────────────────────


class Audit(Document):
    """A codebase audit initiated by a user."""

    user_id: PydanticObjectId
    repo_url: str
    repo_name: str
    status: AuditStatus = AuditStatus.PENDING
    overall_score: Optional[float] = None

    agent_runs: list[AgentRun] = []
    issues: list[Issue] = []
    fix_prs: list[FixPR] = []

    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "audits"
        indexes = [
            IndexModel([("user_id", 1)]),
            IndexModel([("created_at", -1)]),
        ]
