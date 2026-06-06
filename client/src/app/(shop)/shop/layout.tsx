"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { PageLoader } from "@/components/shared/ui";

// Pages under /shop/ that don't need login
const GUEST_ALLOWED = ["/shop", "/shop/products"];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated || isLoading) return;
    const isPublic = GUEST_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!isPublic && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, hydrated, router, pathname]);

  if (!hydrated || isLoading) return <PageLoader />;

  return <>{children}</>;
}
