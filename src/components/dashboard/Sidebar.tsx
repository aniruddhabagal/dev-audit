"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◆" },
  { href: "/dashboard/history", label: "History", icon: "⏱" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

/**
 * Left sidebar for the dashboard shell.
 * Fixed 240px, dark background, accent active states.
 */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="da-sidebar">
      {/* Logo */}
      <Link href="/" className="da-sidebar__logo">
        <span className="da-sidebar__logo-icon">◆</span>
        DevAudit
      </Link>

      {/* Navigation */}
      <nav className="da-sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`da-sidebar__link ${isActive ? "is-active" : ""}`}
            >
              <span className="da-sidebar__link-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="da-sidebar__footer">
        <span className="da-sidebar__version">v0.1.0 — beta</span>
      </div>
    </aside>
  );
}
