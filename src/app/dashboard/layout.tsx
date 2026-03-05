"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

/**
 * Dashboard layout shell — 3-panel dark design.
 *
 * Structure:
 *   [Sidebar 240px] [Main area flex-1]
 *                    [TopBar 56px]
 *                    [Content area]
 *
 * Protected: redirects to "/" if not authenticated.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Show nothing while checking auth
  if (status === "loading") {
    return (
      <div className="da-dashboard da-dashboard--loading">
        <div className="da-dashboard__loader">
          <span className="da-dashboard__loader-dot" />
          <span className="da-dashboard__loader-dot" />
          <span className="da-dashboard__loader-dot" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="da-dashboard">
      <Sidebar />
      <div className="da-dashboard__main">
        <TopBar />
        <main className="da-dashboard__content">{children}</main>
      </div>
    </div>
  );
}
