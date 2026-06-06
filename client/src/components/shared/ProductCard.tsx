"use client";
import React from "react";
import Link from "next/link";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency, getProductImage, getCategoryFallback, productHasRealImage } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "./Button";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateItem, removeItem } = useCart();
  const { toggle, isWishlisted } = useWishlistStore();
  const { user } = useAuthStore();
  const image = getProductImage(product);
  const hasRealImage = productHasRealImage(product);
  const hasDiscount = product.salePrice > 0 && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const wishlisted = isWishlisted(product._id);

  // Find this product in cart
  const cartItem = cart?.items?.find(
    (item: any) =>
      (item.productId?._id || item.productId)?.toString() === product._id?.toString()
  );
  const cartQty = cartItem?.quantity || 0;

  const stockLabel = product.totalStock === 0
    ? "Out of Stock"
    : `${product.totalStock} in stock`;
  const showStockBadge = product.totalStock <= 5;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to use wishlist"); return; }
    toggle(product._id);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartQty <= 1) removeItem(String(product._id));
    else updateItem(String(product._id), cartQty - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    updateItem(String(product._id), cartQty + 1);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/shop/products/${product._id}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
          {hasRealImage ? (
            <img
              src={image}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent && !parent.querySelector(".no-image-placeholder")) {
                  const placeholder = document.createElement("div");
                  placeholder.className = "no-image-placeholder w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2";
                  placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span style="font-size:11px;font-weight:500">No Image</span>`;
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span className="text-xs font-medium">No Image</span>
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#CF1432] text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        {product.totalStock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold text-sm px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {showStockBadge && (
          <span className={`absolute bottom-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${product.totalStock === 0 ? "bg-gray-500" : "bg-amber-500"}`}>
            {stockLabel}
          </span>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center transition-transform hover:scale-110"
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-[#CF1432] text-[#CF1432]" : "text-gray-400"}`} />
        </button>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
        <Link href={`/shop/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-[#CF1432] transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through ml-1.5">{formatCurrency(product.price)}</span>
            )}
          </div>

          {cartQty > 0 ? (
            <div className="flex items-center border border-[#CF1432] rounded-full overflow-hidden">
              <button
                onClick={handleDecrease}
                className="px-2.5 py-1 text-[#CF1432] hover:bg-red-50 transition text-sm font-bold leading-none"
              >−</button>
              <span className="px-2 text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center">{cartQty}</span>
              <button
                onClick={handleIncrease}
                disabled={cartQty >= product.totalStock}
                className="px-2.5 py-1 text-[#CF1432] hover:bg-red-50 transition text-sm font-bold leading-none disabled:opacity-40 disabled:cursor-not-allowed"
              >+</button>
            </div>
          ) : product.totalStock === 0 ? null : (
            <Button
              size="icon"
              onClick={() => addToCart(product._id)}
              className="rounded-full w-9 h-9"
              title="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          )}
        </div>

        {product.averageReview > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(product.averageReview) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.totalReviews})</span>
          </div>
        )}
      </div>
    </div>
  );
}
