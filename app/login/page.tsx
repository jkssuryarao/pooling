"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = login(employeeId, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Invalid credentials. Please try again.");
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-hover px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded bg-accent-light">
            <svg className="h-7 w-7 stroke-accent" viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text">RideShare</h1>
          <p className="mt-1 text-sm text-text-muted">Tally Solutions employee carpooling</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4">
            <label htmlFor="employeeId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Employee ID
            </label>
            <input
              id="employeeId"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded border border-border px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              placeholder="employee or EMP-0012"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-border px-3 py-2.5 pr-10 text-sm focus:border-accent focus:outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs text-text-muted"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p className="mb-3 text-sm text-danger" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={loading || !employeeId || !password}
            className="w-full rounded bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          Trouble signing in? Contact IT helpdesk
        </p>
        <div className="mt-6 rounded bg-accent-light p-3 text-xs text-accent-dark">
          <strong>Demo logins:</strong>
          <table className="mt-1.5 w-full text-left">
            <tbody>
              <tr><td className="pr-2 font-medium">employee</td><td>RideShare@2025</td><td className="text-text-muted">Employee</td></tr>
              <tr><td className="pr-2 font-medium">admin</td><td>Admin@2025</td><td className="text-text-muted">Admin</td></tr>
              <tr><td className="pr-2 font-medium">EMP-0012</td><td>RideShare@2025</td><td className="text-text-muted">Priya</td></tr>
              <tr><td className="pr-2 font-medium">EMP-0099</td><td>Admin@2025</td><td className="text-text-muted">Admin</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
