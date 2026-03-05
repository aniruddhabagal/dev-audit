"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { getAudit } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import SeverityBadge from "@/components/ui/SeverityBadge";
import type { AuditResponse, IssueSeverity } from "@/types/api";

/**
 * Single audit detail page.
 * Week 1 = basic layout with status, agent runs, and issues list.
 * Week 2 will add xterm.js terminal feed and real-time streaming.
 */
export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const backendToken = (session as any)?.backendToken as string | undefined;

  useEffect(() => {
    async function fetchAudit() {
      if (!backendToken || !id) return;
      try {
        const data = await getAudit(id, backendToken);
        setAudit(data);
      } catch (err: any) {
        setError(err.message || "Failed to load audit");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAudit();
  }, [id, backendToken]);

  if (isLoading) {
    return (
      <div className="da-audit-detail da-audit-detail--loading">
        <div className="da-dashboard__loader">
          <span className="da-dashboard__loader-dot" />
          <span className="da-dashboard__loader-dot" />
          <span className="da-dashboard__loader-dot" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="da-audit-detail da-audit-detail--error">
        <p>{error}</p>
      </div>
    );
  }

  if (!audit) return null;

  // Extract owner/repo from URL
  const repoDisplay = audit.repo_name || audit.repo_url;

  return (
    <div className="da-audit-detail">
      {/* Header */}
      <div className="da-audit-detail__header">
        <div className="da-audit-detail__title-row">
          <h1 className="da-audit-detail__title">{repoDisplay}</h1>
          <StatusBadge status={audit.status} />
        </div>
        <p className="da-audit-detail__url">{audit.repo_url}</p>
        {audit.overall_score != null && (
          <div className="da-audit-detail__score">
            Overall Score: <strong>{audit.overall_score.toFixed(1)}</strong>/10
          </div>
        )}
      </div>

      {/* Agent Runs */}
      {audit.agent_runs.length > 0 && (
        <section className="da-audit-detail__section">
          <h2 className="da-audit-detail__section-title">Agent Progress</h2>
          <div className="da-audit-detail__agents">
            {audit.agent_runs.map((run, i) => (
              <div key={i} className="da-agent-run">
                <span className="da-agent-run__name">{run.agent_name}</span>
                <span className={`da-agent-run__status da-agent-run__status--${run.status}`}>
                  {run.status}
                </span>
                {run.findings_count > 0 && (
                  <span className="da-agent-run__findings">
                    {run.findings_count} finding{run.findings_count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Issues */}
      {audit.issues.length > 0 && (
        <section className="da-audit-detail__section">
          <h2 className="da-audit-detail__section-title">
            Issues ({audit.issues.length})
          </h2>
          <div className="da-audit-detail__issues">
            {audit.issues.map((issue, i) => (
              <div key={i} className="da-issue-card">
                <div className="da-issue-card__header">
                  <SeverityBadge severity={issue.severity as IssueSeverity} />
                  <span className="da-issue-card__title">{issue.title}</span>
                </div>
                <p className="da-issue-card__desc">{issue.description}</p>
                {issue.file_path && (
                  <span className="da-issue-card__file">
                    {issue.file_path}
                    {issue.line_number != null && `:${issue.line_number}`}
                  </span>
                )}
                {issue.suggestion && (
                  <div className="da-issue-card__suggestion">
                    <span className="da-issue-card__suggestion-label">Suggestion:</span>
                    <p>{issue.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fix PRs */}
      {audit.fix_prs.length > 0 && (
        <section className="da-audit-detail__section">
          <h2 className="da-audit-detail__section-title">Fix PRs</h2>
          <div className="da-audit-detail__prs">
            {audit.fix_prs.map((pr, i) => (
              <a
                key={i}
                href={pr.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="da-pr-card"
              >
                <span className="da-pr-card__number">#{pr.pr_number}</span>
                <span className={`da-pr-card__status da-pr-card__status--${pr.status}`}>
                  {pr.status}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {audit.issues.length === 0 && audit.status === "pending" && (
        <div className="da-audit-detail__pending">
          <p>Audit is pending. Agents will begin analysis shortly…</p>
        </div>
      )}
    </div>
  );
}
