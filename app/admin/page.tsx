"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useRideStore } from "@/lib/mock/store";
import { useAdminMetrics } from "@/lib/mock/hooks";
import { useAuthStore } from "@/lib/auth-store";

export default function AdminPage() {
  const metrics = useAdminMetrics();
  const reports = useRideStore((s) => s.reports);
  const resolveReport = useRideStore((s) => s.resolveReport);
  const broadcastAnnouncement = useRideStore((s) => s.broadcastAnnouncement);
  const exportCsv = useRideStore((s) => s.exportCsv);
  const importUsers = useRideStore((s) => s.importUsers);
  const addCredentials = useAuthStore((s) => s.addCredentials);
  const [announcement, setAnnouncement] = useState("");
  const [importResult, setImportResult] = useState<{ added: number; errors: string[] } | null>(null);
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

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        setImportResult({ added: 0, errors: ["File has no data rows"] });
        return;
      }

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const requiredCols = ["employeeid", "name", "email", "department", "homelocality", "gender"];
      const missing = requiredCols.filter((c) => !header.includes(c));
      if (missing.length > 0) {
        setImportResult({ added: 0, errors: [`Missing columns: ${missing.join(", ")}`] });
        return;
      }

      const idx = (col: string) => header.indexOf(col);
      const rows: { employeeId: string; name: string; email: string; department: string; homeLocality: string; gender: "MALE" | "FEMALE"; password: string }[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < header.length) {
          parseErrors.push(`Row ${i}: not enough columns`);
          continue;
        }
        const gender = cols[idx("gender")]?.toUpperCase();
        if (gender !== "MALE" && gender !== "FEMALE") {
          parseErrors.push(`Row ${i}: invalid gender "${cols[idx("gender")]}"`);
          continue;
        }
        rows.push({
          employeeId: cols[idx("employeeid")],
          name: cols[idx("name")],
          email: cols[idx("email")],
          department: cols[idx("department")],
          homeLocality: cols[idx("homelocality")],
          gender: gender as "MALE" | "FEMALE",
          password: header.includes("password") && cols[idx("password")] ? cols[idx("password")] : "RideShare@2025",
        });
      }

      const result = importUsers(rows);
      const allErrors = [...parseErrors, ...result.errors];

      if (result.added > 0) {
        const users = useRideStore.getState().users;
        const newCreds = rows
          .filter((r) => !allErrors.some((e) => e.includes(r.employeeId)))
          .map((r) => {
            const user = users.find((u) => u.employeeId.toLowerCase() === r.employeeId.toLowerCase());
            return user
              ? { employeeId: r.employeeId, password: r.password, userId: user.id, role: "employee" as const, name: r.name, email: r.email }
              : null;
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);
        addCredentials(newCreds);
      }

      setImportResult({ added: result.added, errors: allErrors });
    };
    reader.readAsText(file);
    e.target.value = "";
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

      <section className="mb-4 rounded border border-border bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold">Import employees (CSV)</h3>
        <p className="mb-2 text-xs text-text-muted">
          Required columns: employeeId, name, email, department, homeLocality, gender. Optional: password (defaults to RideShare@2025).
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="w-full text-sm file:mr-2 file:rounded file:border-0 file:bg-accent-light file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent-dark"
        />
        {importResult && (
          <div className="mt-3">
            {importResult.added > 0 && (
              <p className="text-sm text-success">{importResult.added} employee(s) imported successfully.</p>
            )}
            {importResult.errors.length > 0 && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded bg-danger-light p-2">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-danger">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <button onClick={handleExport} className="w-full rounded border border-border py-3 text-sm font-medium">
        Export report (CSV)
      </button>
    </AppShell>
  );
}
