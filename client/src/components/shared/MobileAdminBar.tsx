"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Settings, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Home"     },
  { href: "/admin/products",  icon: Package,         label: "Products" },
  { href: "/admin/orders",    icon: ShoppingBag,     label: "Orders"   },
  { href: "/admin/features",  icon: ImageIcon,       label: "Banners"  },
  { href: "/admin/settings",  icon: Settings,        label: "Settings" },
];

export function MobileAdminBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg flex items-center justify-around h-14 px-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors",
              active ? "text-[#CF1432]" : "text-gray-400 hover:text-[#CF1432]"
            )}
          >
            <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
