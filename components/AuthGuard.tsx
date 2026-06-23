"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!session && pathname !== "/login") {
      router.replace("/login");
    } else if (session && pathname === "/login") {
      router.replace("/");
    } else if (session && pathname.startsWith("/admin") && session.role !== "admin") {
      router.replace("/");
    }
  }, [session, pathname, router]);

  if (!session && pathname !== "/login") return null;
  if (session && pathname === "/login") return null;
  if (session && pathname.startsWith("/admin") && session.role !== "admin") return null;

  return <>{children}</>;
}
