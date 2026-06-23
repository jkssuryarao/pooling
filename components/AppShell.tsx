"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const unread = 2; // simplified for demo header badge

  return (
    <>
      {(title || showBell) && (
        <header className="sticky top-0 z-40 border-b border-border bg-surface px-4 py-3">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            {title ? (
              <h1 className="text-base font-semibold text-text">{title}</h1>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-accent-light">
                  <svg className="h-4 w-4 stroke-accent" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold">RideShare</div>
                  <div className="text-[11px] text-text-muted">Tally Solutions</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {session?.user?.role === "admin" && (
                <Link href="/admin" className="rounded border border-border px-2 py-1 text-[11px] font-medium text-text-muted">
                  Admin
                </Link>
              )}
              {showBell && (
                <Link href="/notifications" className="relative flex h-10 w-10 items-center justify-center" aria-label="Notifications">
                  <svg className="h-5 w-5 stroke-text-muted" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-lg px-4 py-4 safe-bottom">{children}</main>
      <MobileNav />
    </>
  );
}
