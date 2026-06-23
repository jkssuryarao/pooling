"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/AppShell";
import { useRideStore } from "@/lib/mock/store";
import { useUserNotifications } from "@/lib/mock/hooks";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const notifications = useUserNotifications(userId);
  const markAllRead = useRideStore((s) => s.markAllRead);
  const markRead = useRideStore((s) => s.markRead);
  const submitRating = useRideStore((s) => s.submitRating);

  return (
    <AppShell title="Notifications">
      <div className="mb-3 flex justify-end">
        <button onClick={() => markAllRead(userId)} className="text-xs font-medium text-accent">
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded border border-border bg-surface p-8 text-center">
          <p className="font-medium">No notifications yet</p>
          <p className="mt-1 text-sm text-text-muted">Ride activity will appear here.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-accent">Go to home</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, 20).map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`rounded border border-border p-3 ${n.isRead ? "bg-surface" : "bg-accent-light/40"}`}
            >
              <div className="flex gap-2">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-text-faint" : "bg-accent"}`} />
                <div className="flex-1">
                  <div className={`text-sm ${n.isRead ? "font-medium text-text-muted" : "font-semibold"}`}>
                    {n.title}
                  </div>
                  <div className="text-sm text-text-muted">{n.summary}</div>
                  <div className="mt-1 text-[11px] text-text-faint">
                    {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {n.type === "RATING_PROMPT" && n.ratingRideId && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            submitRating(n.ratingRideId!, userId, "user-sunita", star);
                            markRead(n.id);
                          }}
                          className="text-lg text-warning hover:scale-110"
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                  {n.rideId && (
                    <Link href={`/rides/${n.rideId}`} className="mt-1 inline-block text-xs text-accent">
                      View ride
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
