import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      // Start as false — we use persisted user for instant render,
      // then checkAuth() in Providers will verify with server and
      // update accordingly. This prevents flash-redirect on refresh.
      isLoading: false,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      isAdmin: () => get().user?.role === "admin",
      isLoggedIn: () => !!get().user,
    }),
    { name: "auth-store", partialize: (s) => ({ user: s.user }) }
  )
);
