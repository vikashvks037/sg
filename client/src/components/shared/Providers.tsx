"use client";
import React, { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";

function AppInit() {
  const { checkAuth } = useAuth();
  const { fetchSettings } = useSettings();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Run settings and auth in parallel; fetch cart after auth resolves
    // Read user from store directly (not closure) to avoid stale state
    fetchSettings();
    checkAuth().then(async () => {
      const user = useAuthStore.getState().user;
      if (user && user.role !== "admin") {
        try {
          const { data } = await api.get(API.shop.cart.get);
          if (data.success) useCartStore.getState().setCart(data.data);
        } catch {/* silent */}
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppInit />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "10px", fontSize: "14px" },
          success: { iconTheme: { primary: "#CF1432", secondary: "#fff" } },
        }}
      />
      {children}
    </>
  );
}
