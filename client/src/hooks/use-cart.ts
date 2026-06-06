"use client";
import { useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

export function useCart() {
  const { cart, itemCount, setCart } = useCartStore();
  const { user } = useAuthStore();

  const fetchCart = useCallback(async () => {
    // Read user directly from store to avoid stale closure after login/checkAuth
    const currentUser = useAuthStore.getState().user ?? user;
    if (!currentUser) return;
    try {
      const { data } = await api.get(API.shop.cart.get);
      if (data.success) setCart(data.data);
    } catch {
      /* silent */
    }
  }, [user, setCart]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) { toast.error("Please login to add to cart"); return; }
      try {
        const { data } = await api.post(API.shop.cart.add, { productId, quantity });
        if (data.success) { setCart(data.data); toast.success("Added to cart!"); }
        else toast.error(data.message || "Failed to add");
      } catch { toast.error("Failed to add to cart"); }
    },
    [user, setCart]
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      try {
        const { data } = await api.put(API.shop.cart.update, { productId, quantity });
        if (data.success) setCart(data.data);
      } catch { toast.error("Failed to update cart"); }
    },
    [setCart]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      try {
        const { data } = await api.delete(API.shop.cart.remove(productId));
        if (data.success) {
          // Server now returns updated cart; if for any reason it's missing, re-fetch
          if (data.data !== undefined) {
            setCart(data.data);
          } else {
            await fetchCart();
          }
          toast.success("Removed from cart");
        }
      } catch { toast.error("Failed to remove item"); }
    },
    [setCart, fetchCart]
  );

  const clearCart = useCallback(async () => {
    try {
      await api.delete(API.shop.cart.clear);
      setCart(null);
    } catch { /* silent */ }
  }, [setCart]);

  return { cart, itemCount, fetchCart, addToCart, updateItem, removeItem, clearCart };
}
