"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

/**
 * User avatar + dropdown menu for the dashboard top bar.
 * Shows avatar circle + username, dropdown with "Sign out".
 */
export default function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const avatarUrl = session.user.image || "";
  const username = session.user.name || "User";

  return (
    <div className="da-user-menu" ref={menuRef}>
      <button
        className="da-user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="da-user-menu__avatar"
            width={32}
            height={32}
          />
        ) : (
          <div className="da-user-menu__avatar da-user-menu__avatar--placeholder">
            {username[0]?.toUpperCase()}
          </div>
        )}
        <span className="da-user-menu__name">{username}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`da-user-menu__chevron ${isOpen ? "is-open" : ""}`}
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="da-user-menu__dropdown">
          <div className="da-user-menu__info">
            <span className="da-user-menu__info-name">{username}</span>
            {session.user.email && (
              <span className="da-user-menu__info-email">{session.user.email}</span>
            )}
          </div>
          <div className="da-user-menu__divider" />
          <button
            className="da-user-menu__action"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
