"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Search, X, LogOut, Package, Settings, Heart } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useSettingsStore } from "@/store/settings-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/utils";

export function Header() {
  const { user } = useAuthStore();
  const { itemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { settings } = useSettingsStore();
  const { logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/shop?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#CF1432] text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>📞 {settings.phone || ""} {settings.phone && settings.email ? <>&nbsp;|&nbsp;</> : null} {settings.email ? <>✉ {settings.email}</> : null}</span>
          <span>Free delivery on orders above ₹{settings.freeDeliveryThreshold || 999}</span>
        </div>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
{/* Logo */}
            <Link href="/" className="flex-shrink-0">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.appName || "SG"} className="h-10 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-[#CF1432] font-playfair">
                  {settings.appName || "SG"}
                </span>
              )}
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:flex">
              <div className="flex w-full rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#CF1432] transition-colors">
                <span className="bg-[#CF1432] px-3 flex items-center">
                  <Search className="w-4 h-4 text-white" />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 text-sm outline-none bg-white"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-auto">
              {/* User */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col items-center text-gray-600 hover:text-[#CF1432] transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px] hidden md:block">
                    {user ? user.userName : "Account"}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-xl w-48 py-2 z-50" style={{minWidth: 180}}>
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold">{user.userName}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        {user.role === "admin" && (
                          <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-[#CF1432]">
                            <Settings className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <Link href="/shop/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <button onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-red-500 w-full">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-gray-50">Login</Link>
                        <Link href="/auth/register" onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-gray-50">Register</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/shop/wishlist" className="relative flex flex-col items-center text-gray-600 hover:text-[#CF1432] transition-colors">
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#CF1432] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] hidden md:block">Wishlist</span>
              </Link>
              {/* Cart */}
              <Link href="/shop/cart" className="relative flex flex-col items-center text-gray-600 hover:text-[#CF1432] transition-colors">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#CF1432] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] hidden md:block">Cart</span>
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mt-3 flex md:hidden">
            <div className="flex w-full rounded-lg overflow-hidden border border-gray-200">
              <span className="bg-[#CF1432] px-3 flex items-center">
                <Search className="w-4 h-4 text-white" />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
            </div>
          </form>
        </div>

        {/* Nav — scrollable so all categories fit */}
        <nav className="border-t border-gray-100 hidden md:block overflow-x-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center whitespace-nowrap">
              <li className="flex-shrink-0">
                <Link href="/shop" className="block px-4 py-2.5 text-sm font-medium hover:text-[#CF1432] transition-colors">
                  All Products
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat} className="flex-shrink-0">
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className="block px-4 py-2.5 text-sm hover:text-[#CF1432] transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

    </>
  );
}
