"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-store";
import { MobileNav } from "@/components/MobileNav";

export function AppShell({
  children,
  title,
  showBell = true,
}: {
  children: React.ReactNode;
  title?: string;
  showBell?: boolean;
}) {
  const { data: session } = useAuth();
  const unread = 2; // simplified for demo header badge

  return (
    <div className="app-shell">
      {(title || showBell) && (
        <header className="safe-top sticky top-0 z-40 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            {title ? (
              <h1 className="text-lg font-bold tracking-tight text-text">{title}</h1>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light shadow-sm">
                  <svg className="h-5 w-5 stroke-accent" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-bold tracking-tight">RideShare</div>
                  <div className="text-xs text-text-muted">Tally Solutions</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {session?.user?.role === "admin" && (
                <Link href="/admin/" className="rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-text-muted">
                  Admin
                </Link>
              )}
              {showBell && (
                <Link href="/notifications/" className="relative flex h-11 w-11 items-center justify-center rounded-xl active:bg-surface-hover" aria-label="Notifications">
                  <svg className="h-5 w-5 stroke-text-muted" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 px-4 py-4 safe-bottom">{children}</main>
      <MobileNav />
    </div>
  );
}
