"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/shared/AdminSidebar";
import { MobileAdminBar } from "@/components/shared/MobileAdminBar";
import { AdminHeader } from "@/components/shared/AdminHeader";
import { useAuthStore } from "@/store/auth-store";
import { PageLoader } from "@/components/shared/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  // Small mount-delay to let zustand rehydrate from localStorage before checking
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/auth/login");
    }
  }, [user, isLoading, hydrated, router]);

  if (!hydrated || isLoading) return <PageLoader />;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Right side: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 pb-20 md:pb-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileAdminBar />
    </div>
  );
}
