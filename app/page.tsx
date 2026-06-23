"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { RideCard } from "@/components/RideCard";
import { useRideStore } from "@/lib/mock/store";
import { useStoreUser, useSuggestedRides } from "@/lib/mock/hooks";
import { greeting } from "@/lib/utils";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ?? "";
  const user = useStoreUser(userId);
  const suggested = useSuggestedRides(userId);
  const getUser = useRideStore((s) => s.getUser);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams({
      date: fd.get("date") as string,
      locality: fd.get("locality") as string,
      timeFrom: fd.get("timeFrom") as string,
      timeTo: fd.get("timeTo") as string,
    });
    router.push(`/search?${params}`);
  }

  return (
    <AppShell showBell>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{greeting(session?.user?.name ?? "there")}</h2>
        <p className="text-sm text-text-muted">Find a shared commute to the office</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded border border-border bg-surface p-3 text-center">
          <div className="text-xl font-semibold text-accent">3</div>
          <div className="text-[11px] text-text-muted">Rides this week</div>
        </div>
        <div className="rounded border border-border bg-surface p-3 text-center">
          <div className="text-xl font-semibold text-success">24 km</div>
          <div className="text-[11px] text-text-muted">Saved today</div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-5 rounded border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold">Search rides</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Date</label>
            <input name="date" type="date" defaultValue={defaultDate} className="w-full rounded border border-border px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Home area</label>
            <input name="locality" type="text" defaultValue={user?.homeLocality ?? "HSR Layout"} className="w-full rounded border border-border px-3 py-2 text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-text-muted">From</label>
              <input name="timeFrom" type="time" defaultValue={user?.commuteTimeFrom ?? "08:00"} className="w-full rounded border border-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">To</label>
              <input name="timeTo" type="time" defaultValue={user?.commuteTimeTo ?? "09:30"} className="w-full rounded border border-border px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        <button type="submit" className="mt-4 w-full rounded bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
          Search rides
        </button>
      </form>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Suggested for you</h3>
        {suggested.length === 0 ? (
          <p className="text-sm text-text-muted">No suggestions right now. Try a broader search.</p>
        ) : (
          <div className="space-y-2">
            {suggested.map((ride) => {
              const poster = getUser(ride.posterId);
              if (!poster) return null;
              return (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  poster={poster}
                  href={`/rides/${ride.id}`}
                  dimmed={ride.availableSeats <= 0}
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-4">
        <Link href="/my-rides" className="text-sm font-medium text-accent hover:underline">
          Manage my rides →
        </Link>
      </div>
    </AppShell>
  );
}
