"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Settings,
  ChevronLeft, ChevronRight, Image as ImageIcon,
} from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products",  icon: Package,         label: "Products"  },
  { href: "/admin/orders",    icon: ShoppingBag,     label: "Orders"    },
  { href: "/admin/features",  icon: ImageIcon,       label: "Banners"   },
  { href: "/admin/settings",  icon: Settings,        label: "Settings"  },
];

export function AdminSidebar() {
  const pathname   = usePathname();
  const { settings } = useSettingsStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-100 text-gray-700 flex flex-col transition-all duration-300 min-h-screen flex-shrink-0 shadow-sm",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* Logo / brand */}
      <div
        className={cn(
          "h-14 border-b border-gray-100 flex items-center flex-shrink-0",
          collapsed ? "justify-center px-2" : "px-4 justify-between"
        )}
      >
        {!collapsed && (
          <span className="font-bold text-lg text-[#CF1432] font-playfair truncate leading-none">
            {settings.appName || "SG"}
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 flex flex-col gap-1 px-2 overflow-hidden">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-all group",
                "h-10 min-w-0",
                active
                  ? "bg-[#CF1432] text-white shadow-sm"
                  : "text-gray-500 hover:bg-red-50 hover:text-[#CF1432]",
                collapsed ? "justify-center px-0 w-10 mx-auto" : "gap-3 px-3"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
