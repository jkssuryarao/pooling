"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Avatar, StatusBadge } from "@/components/Badges";
import { useRideStore } from "@/lib/mock/store";
import { useMyRides, usePendingRequests } from "@/lib/mock/hooks";
import { formatDate } from "@/lib/utils";

type Tab = "active" | "past" | "requests";

export default function MyRidesPage() {
  const { data: session } = useAuth();
  const userId = session?.user?.id ?? "";
  const approveRequest = useRideStore((s) => s.approveRequest);
  const rejectRequest = useRideStore((s) => s.rejectRequest);
  const cancelRide = useRideStore((s) => s.cancelRide);
  const broadcast = useRideStore((s) => s.broadcast);
  const [tab, setTab] = useState<Tab>("active");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const allRides = useMyRides(userId);
  const active = allRides.filter((r) => r.status === "OPEN" || r.status === "FULL");
  const past = allRides.filter((r) => r.status === "COMPLETED" || r.status === "CANCELLED");
  const pending = usePendingRequests(userId);

  return (
    <AppShell title="My rides">
      <div className="mb-4 flex border-b border-border">
        {([
          ["active", `Active (${active.length})`],
          ["past", "Past"],
          ["requests", `Requests (${pending.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 border-b-2 py-2 text-xs font-medium ${
              tab === key ? "border-accent text-accent" : "border-transparent text-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {active.length === 0 ? (
            <div className="rounded border border-border bg-surface p-6 text-center">
              <p className="text-sm text-text-muted">You haven&apos;t posted any rides yet.</p>
              <Link href="/post" className="mt-2 inline-block text-sm font-medium text-accent">Post a ride</Link>
            </div>
          ) : (
            active.map((ride) => {
              const taken = ride.totalSeats - ride.availableSeats;
              return (
                <div key={ride.id} className="rounded border border-border bg-surface p-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{formatDate(ride.date)} · {ride.departureTime}</div>
                      <div className="text-sm text-text-muted">{ride.pickupLocality} → Office</div>
                    </div>
                    <StatusBadge status={ride.status} />
                  </div>
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs text-text-muted">
                      <span>{taken} of {ride.totalSeats} seats taken</span>
                    </div>
                    <div className="h-2 rounded bg-surface-hover">
                      <div className="h-2 rounded bg-accent" style={{ width: `${(taken / ride.totalSeats) * 100}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const msg = prompt("Broadcast message to confirmed riders:");
                        if (msg) broadcast(ride.id, userId, msg);
                      }}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      Broadcast
                    </button>
                    <button
                      onClick={() => setConfirmId(ride.id)}
                      className="rounded border border-danger px-2 py-1 text-xs text-danger"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "past" && (
        <div className="space-y-2">
          {past.map((ride) => (
            <div key={ride.id} className="rounded border border-border bg-surface-subtle p-3 opacity-80">
              <div className="font-medium">{formatDate(ride.date)} · {ride.departureTime}</div>
              <div className="text-sm text-text-muted">{ride.pickupLocality}</div>
              <StatusBadge status={ride.status} />
            </div>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-text-muted">No pending requests.</p>
          ) : (
            pending.map((req) => (
              <div key={req.id} className="rounded border border-border bg-surface p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={req.seeker.name} />
                  <div className="flex-1">
                    <div className="font-semibold">{req.seeker.name}</div>
                    <div className="text-xs text-text-muted">{req.seeker.department} · ★ {req.seeker.avgRating}</div>
                    <div className="text-xs text-text-muted">{formatDate(req.ride.date)} · {req.ride.departureTime}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => approveRequest(req.id, userId)}
                    className="flex-1 rounded bg-success py-2 text-xs font-semibold text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id, userId)}
                    className="flex-1 rounded border border-border py-2 text-xs text-text-muted"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-sm rounded bg-surface p-5">
            <p className="font-semibold">Cancel this ride?</p>
            <p className="mt-1 text-sm text-text-muted">All confirmed seekers will be notified.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 rounded border py-2 text-sm">Keep</button>
              <button
                onClick={() => {
                  cancelRide(confirmId, userId);
                  setConfirmId(null);
                }}
                className="flex-1 rounded bg-danger py-2 text-sm font-semibold text-white"
              >
                Cancel ride
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
