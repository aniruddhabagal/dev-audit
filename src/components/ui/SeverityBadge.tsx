"use client";

import type { IssueSeverity } from "@/types/api";

const SEVERITY_CONFIG: Record<IssueSeverity, { label: string; className: string }> = {
  critical: { label: "CRIT", className: "da-severity-badge--crit" },
  high:     { label: "HIGH", className: "da-severity-badge--high" },
  medium:   { label: "MED",  className: "da-severity-badge--med" },
  low:      { label: "LOW",  className: "da-severity-badge--low" },
};

interface SeverityBadgeProps {
  severity: IssueSeverity;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;

  return (
    <span className={`da-severity-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
