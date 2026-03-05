"use client";

import type { AuditStatus } from "@/types/api";

const STATUS_CONFIG: Record<AuditStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "da-status-badge--pending" },
  running:   { label: "Running",   className: "da-status-badge--running" },
  completed: { label: "Completed", className: "da-status-badge--completed" },
  failed:    { label: "Failed",    className: "da-status-badge--failed" },
};

interface StatusBadgeProps {
  status: AuditStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={`da-status-badge ${config.className}`}>
      {status === "running" && <span className="da-status-badge__pulse" />}
      {config.label}
    </span>
  );
}
