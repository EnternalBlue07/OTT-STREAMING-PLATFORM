import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "authenticated" | "unauthenticated";
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

/** Client-side auth/session UI state. Source of truth remains Better Auth. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  clear: () => set({ user: null, status: "unauthenticated" }),
}));
