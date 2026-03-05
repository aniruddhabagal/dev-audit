"use client";

import UserMenu from "@/components/auth/UserMenu";

interface TopBarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Dashboard top bar with breadcrumb trail and user menu.
 * 56px height, border-bottom divider.
 */
export default function TopBar({ breadcrumbs }: TopBarProps) {
  const crumbs = breadcrumbs || [{ label: "Dashboard" }];

  return (
    <header className="da-topbar">
      <nav className="da-topbar__breadcrumbs" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} className="da-topbar__crumb">
            {i > 0 && <span className="da-topbar__separator">→</span>}
            {crumb.href ? (
              <a href={crumb.href} className="da-topbar__crumb-link">
                {crumb.label}
              </a>
            ) : (
              <span className="da-topbar__crumb-current">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <UserMenu />
    </header>
  );
}
