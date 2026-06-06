"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";
import { useAuth } from "@/hooks/use-auth";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products":  "Products",
  "/admin/orders":    "Orders",
  "/admin/features":  "Banners",
  "/admin/settings":  "Settings",
};

function getPageTitle(pathname: string): string {
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(route)) return title;
  }
  return "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const { settings } = useSettingsStore();
  const { logout } = useAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 gap-3 flex-shrink-0 shadow-sm">
      {/* Logo — mobile only */}
      <Link
        href="/admin/dashboard"
        className="md:hidden font-bold text-lg text-[#CF1432] font-playfair flex-shrink-0"
      >
        {settings.appName || "SG"}
      </Link>

      {/* Divider — mobile only */}
      <div className="md:hidden w-px h-5 bg-gray-200 flex-shrink-0" />

      {/* Page title */}
      <h1 className="flex-1 text-xl font-bold font-playfair text-gray-900 truncate">
        {title}
      </h1>

      {/* Logout — mobile only */}
      <button
        onClick={logout}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:bg-red-50 hover:text-[#CF1432] transition-colors flex-shrink-0"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
