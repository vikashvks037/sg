import { create } from "zustand";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Product } from "@/types";
import toast from "react-hot-toast";

interface WishlistStore {
  items: Product[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get(API.shop.wishlist.get);
      if (data.success) set({ items: data.data });
    } catch {/* silent */}
    finally { set({ loading: false }); }
  },

  toggle: async (productId: string) => {
    try {
      const { data } = await api.post(API.shop.wishlist.toggle, { productId });
      if (data.success) {
        if (data.added) {
          toast.success("Added to wishlist ❤️");
        } else {
          toast.success("Removed from wishlist");
        }
        // Refetch to keep in sync with populated data
        get().fetchWishlist();
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  },

  isWishlisted: (productId: string) =>
    get().items.some((p) => p._id === productId),
}));
