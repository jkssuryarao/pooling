"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Avatar, StatusBadge, VerifiedBadge } from "@/components/Badges";
import { DayChips, SeatVisualizer } from "@/components/RideCard";
import { useRideStore } from "@/lib/mock/store";
import { useRideWithPoster } from "@/lib/mock/hooks";
import { formatDate } from "@/lib/utils";

export default function RideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ?? "";
  const data = useRideWithPoster(id);
  const requests = useRideStore((s) => s.requests);
  const sendRequest = useRideStore((s) => s.sendRequest);
  const joinWaitlist = useRideStore((s) => s.joinWaitlist);
  const getOrCreateThread = useRideStore((s) => s.getOrCreateThread);
  const getRequestForRide = useRideStore((s) => s.getRequestForRide);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState("");

  if (!data) {
    return (
      <AppShell title="Ride detail">
        <p>Ride not found.</p>
        <Link href="/search" className="text-accent">← Back to search</Link>
      </AppShell>
    );
  }

  const { ride, poster, vehicle } = data;
  const existing = getRequestForRide(ride.id, userId);
  const isFull = ride.availableSeats <= 0;

  function handleRequest() {
    const res = sendRequest(ride.id, userId);
    if (!res.ok) {
      setMsg(res.error ?? "Failed");
      return;
    }
    setShowConfirm(false);
    setMsg("Request sent — awaiting approval");
  }

  function handleWaitlist() {
    const res = joinWaitlist(ride.id, userId);
    setMsg(res.ok ? "Added to waitlist" : res.error ?? "Failed");
  }

  function handleMessage() {
    const threadId = getOrCreateThread(ride.id, userId, ride.posterId);
    router.push(`/messages/${threadId}`);
  }

  return (
    <AppShell title="Ride detail">
      <Link href="/search" className="mb-3 inline-flex text-sm text-accent">← Back</Link>

      <div className="rounded border border-border bg-surface p-4">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={poster.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{poster.name}</span>
              {poster.isVerified && <VerifiedBadge />}
            </div>
            <div className="text-sm text-text-muted">{poster.department}</div>
            <div className="text-sm text-text-muted">★ {poster.avgRating} · {poster.tripCount} trips</div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-text-muted">Date</span><div className="font-medium">{formatDate(ride.date)}</div></div>
          <div><span className="text-text-muted">Departure</span><div className="font-medium">{ride.departureTime}</div></div>
          <div><span className="text-text-muted">Pickup area</span><div className="font-medium">{ride.pickupLocality}</div></div>
          <div><span className="text-text-muted">Destination</span><div className="font-medium">{ride.destination}</div></div>
          {vehicle && (
            <>
              <div><span className="text-text-muted">Vehicle</span><div className="font-medium">{vehicle.make} {vehicle.model}</div></div>
              <div><span className="text-text-muted">AC</span><div className="font-medium">{vehicle.isAc ? "Yes" : "No"}</div></div>
            </>
          )}
          {ride.rideType === "CAB" && ride.cabNote && (
            <div className="col-span-2"><span className="text-text-muted">Cab note</span><div className="font-medium">{ride.cabNote}</div></div>
          )}
        </div>

        <div className="mb-4">
          <div className="mb-1 text-xs text-text-muted">Seats</div>
          <SeatVisualizer total={ride.totalSeats} available={ride.availableSeats} />
        </div>

        <div className="mb-4">
          <div className="mb-1 text-xs text-text-muted">{ride.isRecurring ? "Recurring days" : "Schedule"}</div>
          {ride.isRecurring ? <DayChips days={ride.recurringDays} /> : <span className="text-sm">One-time ride</span>}
        </div>

        <StatusBadge status={ride.status} />

        <p className="mt-4 text-xs italic text-text-faint">Poster&apos;s exact address is never shown.</p>
      </div>

      {msg && <p className="mt-3 text-sm text-success">{msg}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {existing ? (
          <button disabled className="w-full rounded bg-surface-hover py-3 text-sm font-semibold text-text-muted">
            {existing.status === "APPROVED"
              ? "Confirmed for this ride"
              : existing.status === "WAITLISTED"
              ? `On waitlist · position ${existing.waitlistPosition}`
              : "Request sent — awaiting approval"}
          </button>
        ) : isFull ? (
          <button onClick={handleWaitlist} className="w-full rounded bg-warning-light py-3 text-sm font-semibold text-warning border border-warning">
            Join waitlist
          </button>
        ) : (
          <button onClick={() => setShowConfirm(true)} className="w-full rounded bg-accent py-3 text-sm font-semibold text-white">
            Request this ride
          </button>
        )}
        <button onClick={handleMessage} className="w-full rounded border border-border py-3 text-sm font-medium text-text-muted">
          Message {poster.name.split(" ")[0]} first
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-sm rounded bg-surface p-5 shadow-lg">
            <h3 className="font-semibold">Confirm request</h3>
            <p className="mt-2 text-sm text-text-muted">
              {ride.departureTime}, {ride.pickupLocality}, {formatDate(ride.date)}
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded border border-border py-2 text-sm">Cancel</button>
              <button onClick={handleRequest} className="flex-1 rounded bg-accent py-2 text-sm font-semibold text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
