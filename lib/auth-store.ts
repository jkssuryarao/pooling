"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_CREDENTIALS, type Credential } from "./mock/credentials";

export interface AuthSession {
  userId: string;
  role: "employee" | "admin";
  name: string;
  email: string;
  employeeId: string;
}

interface AuthStore {
  session: AuthSession | null;
  credentials: Credential[];
  login: (employeeId: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  addCredentials: (creds: Credential[]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      credentials: SEED_CREDENTIALS,

      login(employeeId, password) {
        const match = get().credentials.find(
          (c) => c.employeeId.toLowerCase() === employeeId.trim().toLowerCase() && c.password === password
        );
        if (!match) return { ok: false, error: "Invalid credentials. Please try again." };
        set({
          session: {
            userId: match.userId,
            role: match.role,
            name: match.name,
            email: match.email,
            employeeId: match.employeeId,
          },
        });
        return { ok: true };
      },

      logout() {
        set({ session: null });
      },

      addCredentials(creds) {
        set((s) => {
          const existing = new Set(s.credentials.map((c) => c.employeeId.toLowerCase()));
          const novel = creds.filter((c) => !existing.has(c.employeeId.toLowerCase()));
          return { credentials: [...s.credentials, ...novel] };
        });
      },
    }),
    {
      name: "rideshare-auth-v1",
    }
  )
);

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  if (!session) return { data: null, logout };
  return {
    data: {
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    },
    logout,
  };
}
