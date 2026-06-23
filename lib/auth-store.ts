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
  importedCredentials: Credential[];
  _hydrated: boolean;
  login: (employeeId: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  addCredentials: (creds: Credential[]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      importedCredentials: [],
      _hydrated: false,

      login(employeeId, password) {
        const id = employeeId.trim().toLowerCase();
        const allCreds = [...get().importedCredentials, ...SEED_CREDENTIALS];
        const match = allCreds.find(
          (c) => c.employeeId.toLowerCase() === id && c.password === password
        );
        if (!match) {
          return {
            ok: false,
            error: "Invalid credentials. Try employee / RideShare@2025 or EMP-0012 / RideShare@2025",
          };
        }
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
          const byId = new Map(s.importedCredentials.map((c) => [c.employeeId.toLowerCase(), c]));
          for (const c of creds) {
            byId.set(c.employeeId.toLowerCase(), c);
          }
          return { importedCredentials: Array.from(byId.values()) };
        });
      },
    }),
    {
      name: "rideshare-auth-v1",
      partialize: (state) => ({ session: state.session, importedCredentials: state.importedCredentials }),
      merge: (persisted, current) => ({
        ...current,
        session: (persisted as Partial<AuthStore>)?.session ?? null,
        importedCredentials: (persisted as Partial<AuthStore>)?.importedCredentials ?? [],
        _hydrated: true,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ _hydrated: true });
      },
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
