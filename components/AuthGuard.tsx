"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const hydrated = useAuthStore((s) => s._hydrated);
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Guarantee hydration completes (persist rehydrate can stall on static export)
  useEffect(() => {
    const finish = () => useAuthStore.setState({ _hydrated: true });
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    useAuthStore.persist.rehydrate();
    const fallback = setTimeout(finish, 300);
    return () => {
      unsub();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setReady(true);
    if (!session && pathname !== "/login") {
      router.replace("/login/");
    } else if (session && pathname === "/login") {
      router.replace("/");
    } else if (session && pathname.startsWith("/admin") && session.role !== "admin") {
      router.replace("/");
    }
  }, [session, hydrated, pathname, router]);

  const isLogin = pathname === "/login" || pathname === "/login/";

  if (!hydrated || !ready) {
    if (isLogin) return <>{children}</>;
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-hover">
        <div className="text-sm text-text-muted">Loading…</div>
      </div>
    );
  }

  if (!session && !isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-hover">
        <div className="text-sm text-text-muted">Redirecting to login…</div>
      </div>
    );
  }

  if (session && isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-hover">
        <div className="text-sm text-text-muted">Redirecting…</div>
      </div>
    );
  }

  if (session && pathname.startsWith("/admin") && session.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-hover">
        <div className="text-sm text-text-muted">Redirecting…</div>
      </div>
    );
  }

  return <>{children}</>;
}
