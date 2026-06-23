"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useRideStore } from "@/lib/mock/store";
import { useAdminMetrics } from "@/lib/mock/hooks";

export default function AdminPage() {
  const metrics = useAdminMetrics();
  const reports = useRideStore((s) => s.reports);
  const resolveReport = useRideStore((s) => s.resolveReport);
  const broadcastAnnouncement = useRideStore((s) => s.broadcastAnnouncement);
  const exportCsv = useRideStore((s) => s.exportCsv);
  const [announcement, setAnnouncement] = useState("");
  const maxRoute = Math.max(...metrics.topRoutes.map((r) => r.count), 1);

  function handleExport() {
    const csv = exportCsv();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rideshare-export.csv";
    a.click();
  }

  return (
    <AppShell title="Admin dashboard">
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded border border-border bg-surface p-3 text-center">
          <div className="text-xl font-semibold text-accent">{metrics.activeToday}</div>
          <div className="text-[10px] text-text-muted">Active today</div>
        </div>
        <div className="rounded border border-border bg-surface p-3 text-center">
          <div className="text-xl font-semibold text-success">{metrics.participationRate}%</div>
          <div className="text-[10px] text-text-muted">Participation</div>
        </div>
        <div className="rounded border border-border bg-surface p-3 text-center">
          <div className="text-xl font-semibold text-text">{metrics.tripsThisMonth}</div>
          <div className="text-[10px] text-text-muted">Trips / month</div>
        </div>
      </div>

      <section className="mb-4 rounded border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold">Top routes</h3>
        {metrics.topRoutes.map((r) => (
          <div key={r.route} className="mb-2">
            <div className="flex justify-between text-xs">
              <span>{r.route}</span>
              <span className="font-medium">{r.count}</span>
            </div>
            <div className="mt-1 h-2 rounded bg-surface-hover">
              <div className="h-2 rounded bg-accent" style={{ width: `${(r.count / maxRoute) * 100}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="mb-4 rounded border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold">Pending actions</h3>
        {reports.filter((r) => r.status === "OPEN").map((r) => (
          <div key={r.id} className="mb-2 rounded border border-danger bg-danger-light p-3">
            <div className="text-sm font-medium text-danger">Misconduct report</div>
            <div className="text-xs text-text-muted">{r.reason}</div>
            <div className="mt-2 flex gap-2">
              {(["Warn", "Suspend", "Dismiss"] as const).map((action) => (
                <button
                  key={action}
                  onClick={() => resolveReport(r.id, action)}
                  className="rounded border border-border bg-surface px-2 py-1 text-xs"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
        {reports.filter((r) => r.status === "OPEN").length === 0 && (
          <p className="text-sm text-text-muted">No pending reports.</p>
        )}
      </section>

      <section className="mb-4 rounded border border-border bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold">Broadcast announcement</h3>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value.slice(0, 500))}
          placeholder="Message to all employees (max 500 chars)"
          className="w-full rounded border border-border p-2 text-sm"
          rows={3}
        />
        <button
          onClick={() => {
            if (announcement.trim()) {
              broadcastAnnouncement(announcement.trim());
              setAnnouncement("");
            }
          }}
          className="mt-2 rounded bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Send to all
        </button>
      </section>

      <button onClick={handleExport} className="w-full rounded border border-border py-3 text-sm font-medium">
        Export report (CSV)
      </button>
    </AppShell>
  );
}
