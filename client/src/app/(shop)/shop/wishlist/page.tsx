"use client";
import React, { useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { ProductCard } from "@/components/shared/ProductCard";
import { PageLoader, Empty } from "@/components/shared/ui";

export default function WishlistPage() {
  const { items, loading, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-[#CF1432]" />
        <h1 className="text-2xl font-bold font-playfair">My Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-gray-500">({items.length} {items.length === 1 ? "item" : "items"})</span>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <Empty
          title="Your wishlist is empty"
          description="Save items you love by clicking the heart icon on any product."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
