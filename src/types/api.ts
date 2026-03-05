/**
 * TypeScript types mirroring backend Pydantic schemas.
 *
 * Keep in sync with:
 *   backend/app/schemas/audit.py
 *   backend/app/schemas/user.py
 *   backend/app/models/audit.py
 */

// ── Enums ────────────────────────────────────────────────

export type AuditStatus = "pending" | "running" | "completed" | "failed";

export type IssueSeverity = "critical" | "high" | "medium" | "low";

// ── Embedded Models ──────────────────────────────────────

export interface AgentRun {
  agent_name: string;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  findings_count: number;
}

export interface Issue {
  agent: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  file_path?: string | null;
  line_number?: number | null;
  suggestion?: string | null;
}

export interface FixPR {
  issue_index: number;
  pr_url: string;
  pr_number: number;
  status: string;
}

// ── API Response Types ───────────────────────────────────

export interface AuditResponse {
  id: string;
  user_id: string;
  repo_url: string;
  repo_name: string;
  status: AuditStatus;
  overall_score?: number | null;
  agent_runs: AgentRun[];
  issues: Issue[];
  fix_prs: FixPR[];
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface AuditListItem {
  id: string;
  repo_url: string;
  repo_name: string;
  status: AuditStatus;
  overall_score?: number | null;
  issues_count: number;
  created_at: string;
}

export interface UserResponse {
  id: string;
  github_id: number;
  username: string;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

// ── Request Types ────────────────────────────────────────

export interface AuditCreate {
  repo_url: string;
}
