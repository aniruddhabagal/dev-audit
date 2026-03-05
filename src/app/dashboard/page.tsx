"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RepoInput from "@/components/dashboard/RepoInput";
import AuditCard from "@/components/dashboard/AuditCard";
import { startAudit, listAudits } from "@/lib/api";
import type { AuditListItem } from "@/types/api";

/**
 * Dashboard home — "Start an Audit" state.
 *
 * Shows a large repo input + recent audits grid.
 */
export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [audits, setAudits] = useState<AuditListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  const backendToken = (session as any)?.backendToken as string | undefined;

  // Fetch recent audits on mount
  useEffect(() => {
    async function fetchAudits() {
      if (sessionStatus === "loading") return;
      if (!backendToken) {
        setIsFetching(false);
        return;
      }
      try {
        const data = await listAudits(backendToken, 0, 10);
        setAudits(data);
      } catch (err: any) {
        console.error("Failed to fetch audits:", err);
      } finally {
        setIsFetching(false);
      }
    }
    fetchAudits();
  }, [backendToken, sessionStatus]);

  // Start a new audit
  const handleStartAudit = useCallback(
    async (repoUrl: string) => {
      if (!backendToken) {
        setError("Not authenticated with backend. Please sign out and sign back in.");
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const audit = await startAudit(repoUrl, backendToken);
        router.push(`/dashboard/audit/${audit.id}`);
      } catch (err: any) {
        console.error("Failed to start audit:", err);
        setError(err.message || "Failed to start audit. Is the backend running?");
        setIsLoading(false);
      }
    },
    [backendToken, router]
  );

  return (
    <div className="da-dashboard-home">
      {/* Hero section */}
      <div className="da-dashboard-home__hero">
        <h1 className="da-dashboard-home__title">
          Start an Audit
        </h1>
        <p className="da-dashboard-home__subtitle">
          Paste a GitHub repository URL to begin your AI-powered code review.
        </p>
        <RepoInput onSubmit={handleStartAudit} isLoading={isLoading} />
        {error && (
          <p className="da-dashboard-home__error">{error}</p>
        )}
      </div>

      {/* Recent Audits */}
      <section className="da-dashboard-home__recent">
        <h2 className="da-dashboard-home__section-title">Recent Audits</h2>

        {isFetching ? (
          <div className="da-dashboard-home__placeholder">
            <span className="da-dashboard__loader-dot" />
            <span className="da-dashboard__loader-dot" />
            <span className="da-dashboard__loader-dot" />
          </div>
        ) : audits.length === 0 ? (
          <div className="da-dashboard-home__empty">
            <p>No audits yet. Paste a repo URL above to get started.</p>
          </div>
        ) : (
          <div className="da-dashboard-home__grid">
            {audits.map((audit) => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

