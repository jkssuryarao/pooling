"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useRideStore } from "@/lib/mock/store";
import { useStoreUser, useUserVehicles } from "@/lib/mock/hooks";
import type { GenderPref, RideType } from "@/lib/mock/types";

export default function PostRidePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ?? "";
  const user = useStoreUser(userId);
  const vehicles = useUserVehicles(userId);
  const createRide = useRideStore((s) => s.createRide);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [rideType, setRideType] = useState<RideType>("CAR");
  const [isRecurring, setIsRecurring] = useState(true);
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [genderPref, setGenderPref] = useState<GenderPref>("ANY");
  const [toast, setToast] = useState("");

  function toggleDay(d: string) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = createRide({
      posterId: userId,
      rideType,
      date: fd.get("date") as string,
      departureTime: fd.get("time") as string,
      pickupLocality: fd.get("locality") as string,
      totalSeats: parseInt(fd.get("seats") as string, 10),
      isRecurring,
      recurringDays: isRecurring ? days : [],
      genderPref,
      deptRestriction: fd.get("deptOnly") === "on" ? user?.department ?? null : null,
      autoApproveDept: fd.get("autoApprove") === "on",
      vehicleId: rideType === "CAR" ? vehicles[0]?.id ?? null : null,
      cabNote: rideType === "CAB" ? (fd.get("cabNote") as string) : undefined,
    });
    setToast("Ride posted successfully!");
    setTimeout(() => router.push("/my-rides"), 800);
    return id;
  }

  return (
    <AppShell title="Post a ride">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(["CAR", "CAB"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRideType(t)}
              className={`rounded border p-3 text-sm font-medium ${
                rideType === t ? "border-accent bg-accent-light text-accent-dark" : "border-border"
              }`}
            >
              {t === "CAR" ? "My car" : "Shared cab"}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-muted">Pickup area</label>
          <input name="locality" defaultValue={user?.homeLocality} className="w-full rounded border border-border px-3 py-2 text-sm" required />
          <p className="mt-1 text-[11px] text-text-faint">Only your area name is shown</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Date</label>
            <input name="date" type="date" defaultValue={defaultDate} className="w-full rounded border border-border px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Departure time</label>
            <input name="time" type="time" defaultValue="08:30" className="w-full rounded border border-border px-3 py-2 text-sm" required />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
            Recurring (weekdays)
          </label>
        </div>

        {isRecurring && (
          <div className="flex flex-wrap gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`rounded border px-3 py-1 text-xs ${
                  days.includes(d) ? "border-accent bg-accent-light text-accent-dark" : "border-border text-text-muted"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-text-muted">Seats offered</label>
          <select name="seats" className="w-full rounded border border-border px-3 py-2 text-sm" defaultValue="2">
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {rideType === "CAB" && (
          <div>
            <label className="mb-1 block text-xs text-text-muted">Cab note</label>
            <input name="cabNote" placeholder="e.g. Ola booked — sharing fare" className="w-full rounded border border-border px-3 py-2 text-sm" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <select value={genderPref} onChange={(e) => setGenderPref(e.target.value as GenderPref)} className="rounded border border-border px-3 py-2 text-xs">
            <option value="ANY">Any gender</option>
            <option value="FEMALE">Female only</option>
          </select>
          <label className="flex items-center gap-1 text-xs">
            <input name="deptOnly" type="checkbox" /> Same dept only
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input name="autoApprove" type="checkbox" /> Auto-approve verified
          </label>
        </div>

        <p className="text-xs italic text-text-faint">Draft saved if you navigate away.</p>

        {toast && <p className="text-sm text-success">{toast}</p>}

        <button type="submit" className="w-full rounded bg-accent py-3 text-sm font-semibold text-white">
          Post ride
        </button>
      </form>
    </AppShell>
  );
}
