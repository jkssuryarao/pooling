"use client";

import Link from "next/link";
import { Avatar, StatusBadge, VerifiedBadge } from "@/components/Badges";
import { formatDate, seatColor } from "@/lib/utils";
import type { Ride, User } from "@/lib/mock/types";

interface RideCardProps {
  ride: Ride;
  poster: User;
  dimmed?: boolean;
  waitlistAhead?: number | null;
  href?: string;
}

export function RideCard({ ride, poster, dimmed, waitlistAhead, href }: RideCardProps) {
  const sc = seatColor(ride.availableSeats);
  const seatCls =
    sc === "success" ? "text-success" : sc === "warning" ? "text-warning" : "text-danger";

  const content = (
    <div
      className={`rounded border border-border bg-surface p-3 transition-colors hover:border-gray-300 ${
        dimmed || ride.availableSeats <= 0 ? "opacity-55" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={poster.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-text">{poster.name}</span>
            {poster.isVerified && <VerifiedBadge />}
          </div>
          <div className="text-xs text-text-muted">
            {poster.department} · ★ {poster.avgRating} ({poster.tripCount} trips)
          </div>
          <div className="mt-1 text-xs text-text-muted">📍 {ride.pickupLocality}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-accent-dark">{ride.departureTime}</div>
          <div className={`text-[11px] font-medium ${seatCls}`}>
            {ride.availableSeats <= 0
              ? "Full"
              : `${ride.availableSeats} seat${ride.availableSeats > 1 ? "s" : ""}`}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent-dark">
          {ride.rideType === "CAR" ? "Car" : "Cab"}
        </span>
        <span className="text-[11px] text-text-muted">{formatDate(ride.date)}</span>
        <StatusBadge status={ride.status === "FULL" ? "FULL" : ride.status} />
        {waitlistAhead != null && (
          <span className="text-[11px] text-warning">Waitlist · {waitlistAhead} ahead</span>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export function DayChips({ days, allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }: { days: string[]; allDays?: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {allDays.map((d) => (
        <span
          key={d}
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            days.includes(d) ? "bg-accent-light text-accent-dark" : "bg-surface-hover text-text-faint"
          }`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export function SeatVisualizer({ total, available }: { total: number; available: number }) {
  const taken = total - available;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-6 w-6 rounded border-2 ${
              i < taken ? "border-text-faint bg-text-faint" : "border-accent bg-accent-light"
            }`}
            aria-hidden
          />
        ))}
      </div>
      <span className="text-xs text-text-muted">{available} seats available</span>
    </div>
  );
}
