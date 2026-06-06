"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

export function useAuth() {
  const { user, setUser, setLoading, isAdmin, isLoggedIn } = useAuthStore();
  const { setCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API.auth.check);
      if (data.success && data.user) {
        setUser(data.user);
        if (data.user.role === "user") fetchWishlist();
      } else {
        // Server said not authenticated — clear local state
        setUser(null);
      }
    } catch {
      // Network error — keep persisted user so app works offline-ish,
      // but stop the loading spinner
      setLoading(false);
    }
  }, [setUser, setLoading, fetchWishlist]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await api.post(API.auth.login, { email, password });
        if (data.success) {
          setUser(data.user);
          toast.success(data.message || "Logged in!");
          // Fetch cart & wishlist immediately so header counts update right away
          if (data.user.role === "user") {
            try {
              const [cartRes] = await Promise.all([
                api.get(API.shop.cart.get),
                fetchWishlist(),
              ]);
              if (cartRes.data.success) setCart(cartRes.data.data);
            } catch {/* silent */}
          }
          // Small delay to let state settle before redirect
          setTimeout(() => {
            if (data.user.role === "admin") router.push("/admin/dashboard");
            else router.push("/");
          }, 100);
        } else {
          toast.error(data.message || "Login failed");
        }
        return data;
      } catch (err: any) {
        const message = err?.response?.data?.message || "Login failed. Please try again.";
        toast.error(message);
        return { success: false, message };
      }
    },
    [setUser, setCart, fetchWishlist, router]
  );

  const register = useCallback(
    async (payload: { userName: string; email: string; password: string; phone?: string }) => {
      try {
        const { data } = await api.post(API.auth.register, payload);
        if (data.success) {
          toast.success(data.message || "Account created!");
          router.push("/auth/login");
        } else {
          toast.error(data.message || "Registration failed");
        }
        return data;
      } catch (err: any) {
        const message = err?.response?.data?.message || "Registration failed. Please try again.";
        toast.error(message);
        return { success: false, message };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(API.auth.logout);
    } catch {
      /* ignore network errors on logout */
    }
    setUser(null);
    setCart(null);
    useWishlistStore.setState({ items: [] });
    router.push("/");
  }, [setUser, setCart, router]);

  return { user, isAdmin, isLoggedIn, checkAuth, login, register, logout };
}
