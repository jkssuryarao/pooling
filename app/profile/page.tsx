"use client";

import { signOut, useSession } from "next-auth/react";
import { AppShell } from "@/components/AppShell";
import { Avatar, VerifiedBadge } from "@/components/Badges";
import { useRideStore } from "@/lib/mock/store";
import { useStoreUser } from "@/lib/mock/hooks";

export default function ProfilePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const user = useStoreUser(userId);
  const reset = useRideStore((s) => s.reset);

  return (
    <AppShell title="Profile" showBell={false}>
      {user && (
        <div className="rounded border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{user.name}</span>
                {user.isVerified && <VerifiedBadge />}
              </div>
              <div className="text-sm text-text-muted">{user.employeeId} · {user.department}</div>
              <div className="text-sm text-text-muted">★ {user.avgRating} · {user.tripCount} trips</div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div><span className="text-text-muted">Home area:</span> {user.homeLocality}</div>
            <div><span className="text-text-muted">Commute:</span> {user.commuteTimeFrom} – {user.commuteTimeTo}</div>
            <div><span className="text-text-muted">Days:</span> {user.commuteDays.join(", ")}</div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {session?.user?.role === "admin" && (
          <a href="/admin" className="block rounded border border-border bg-surface px-4 py-3 text-sm font-medium">
            Admin dashboard →
          </a>
        )}
        <button
          onClick={() => {
            if (confirm("Reset all demo data to defaults?")) reset();
          }}
          className="w-full rounded border border-border bg-surface px-4 py-3 text-sm text-text-muted"
        >
          Reset demo data
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded border border-danger bg-danger-light px-4 py-3 text-sm font-medium text-danger"
        >
          Sign out
        </button>
      </div>
    </AppShell>
  );
}
