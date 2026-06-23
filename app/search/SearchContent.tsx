"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RideCard } from "@/components/RideCard";
import { useRideStore } from "@/lib/mock/store";
import { useSearchResults } from "@/lib/mock/hooks";
import type { GenderPref, RideType } from "@/lib/mock/types";

export default function SearchContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = session?.user?.id ?? "";
  const getUser = useRideStore((s) => s.getUser);
  const getWaitlistPosition = useRideStore((s) => s.getWaitlistPosition);

  const [rideType, setRideType] = useState<RideType | "ALL">("ALL");
  const [gender, setGender] = useState<GenderPref | "ALL">("ALL");
  const [acOnly, setAcOnly] = useState(false);

  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const locality = searchParams.get("locality") ?? "HSR Layout";
  const timeFrom = searchParams.get("timeFrom") ?? "08:00";
  const timeTo = searchParams.get("timeTo") ?? "09:30";

  const results = useSearchResults(
    userId,
    { date, locality, timeFrom, timeTo },
    {
      rideType: rideType === "ALL" ? undefined : rideType,
      gender: gender === "ALL" ? undefined : gender,
      acOnly,
    }
  );

  return (
    <AppShell title="Ride results">
      <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-accent">
        ← Back
      </Link>
      <p className="mb-3 text-xs text-text-muted">
        {results.length} rides found · {locality} · {timeFrom}–{timeTo}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "CAR", "CAB"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setRideType(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              rideType === t ? "border-accent bg-accent-light text-accent-dark" : "border-border text-text-muted"
            }`}
          >
            {t === "ALL" ? "All types" : t === "CAR" ? "Car" : "Cab"}
          </button>
        ))}
        {(["ALL", "FEMALE"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              gender === g ? "border-accent bg-accent-light text-accent-dark" : "border-border text-text-muted"
            }`}
          >
            {g === "ALL" ? "Any gender" : "Female only"}
          </button>
        ))}
        <button
          onClick={() => setAcOnly(!acOnly)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            acOnly ? "border-accent bg-accent-light text-accent-dark" : "border-border text-text-muted"
          }`}
        >
          AC only
        </button>
      </div>

      {results.length === 0 ? (
        <div className="rounded border border-border bg-surface p-8 text-center">
          <p className="font-medium text-text">No rides found for this time and area</p>
          <p className="mt-1 text-sm text-text-muted">Try adjusting your departure window or check back tomorrow.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Broaden search
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((ride) => {
            const poster = getUser(ride.posterId);
            if (!poster) return null;
            const wl = getWaitlistPosition(ride.id, userId);
            return (
              <RideCard
                key={ride.id}
                ride={ride}
                poster={poster}
                dimmed={ride.availableSeats <= 0}
                waitlistAhead={wl}
                href={`/rides/${ride.id}`}
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
