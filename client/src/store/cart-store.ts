import { create } from "zustand";
import { Cart } from "@/types";

interface CartState {
  cart: Cart | null;
  itemCount: number;
  setCart: (cart: Cart | null) => void;
}

export const useCartStore = create<CartState>()((set) => ({
  cart: null,
  itemCount: 0,
  setCart: (cart) =>
    set({
      cart,
      itemCount: cart?.items?.length || 0,
    }),
}));
