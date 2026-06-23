"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      employeeId,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials. Please try again.");
      return;
    }
    router.push("/");
    router.refresh();
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
              placeholder="employee"
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

          <div className="my-5 flex items-center gap-3 text-xs text-text-faint">
            <div className="h-px flex-1 bg-border" />
            <span>— or —</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => alert("SSO not configured in demo. Use employee / RideShare@2025")}
            className="w-full rounded border border-border py-2.5 text-sm font-medium text-text-muted hover:bg-surface-hover"
          >
            Sign in with company SSO
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          Trouble signing in? Contact IT helpdesk
        </p>
        <div className="mt-6 rounded bg-accent-light p-3 text-xs text-accent-dark">
          <strong>Demo:</strong> employee / RideShare@2025 · admin / Admin@2025
        </div>
      </div>
    </div>
  );
}
