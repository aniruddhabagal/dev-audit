"use client";

import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { AuditListItem } from "@/types/api";

/**
 * Format a date string to relative time (e.g., "2 hours ago").
 */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/**
 * Extract owner/repo from a full GitHub URL.
 */
function extractRepoName(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // fallback
  }
  return url;
}

interface AuditCardProps {
  audit: AuditListItem;
}

/**
 * Dark card showing audit summary — clickable, navigates to detail.
 */
export default function AuditCard({ audit }: AuditCardProps) {
  const repoDisplay = audit.repo_name || extractRepoName(audit.repo_url);

  return (
    <Link href={`/dashboard/audit/${audit.id}`} className="da-audit-card">
      <div className="da-audit-card__header">
        <span className="da-audit-card__repo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="da-audit-card__repo-icon">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8V1.5zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
          </svg>
          {repoDisplay}
        </span>
        <StatusBadge status={audit.status} />
      </div>

      <div className="da-audit-card__meta">
        {audit.issues_count > 0 && (
          <span className="da-audit-card__issues">
            {audit.issues_count} issue{audit.issues_count !== 1 ? "s" : ""}
          </span>
        )}
        {audit.overall_score != null && (
          <span className="da-audit-card__score">
            Score: {audit.overall_score.toFixed(1)}
          </span>
        )}
        <span className="da-audit-card__time">{timeAgo(audit.created_at)}</span>
      </div>
    </Link>
  );
}
