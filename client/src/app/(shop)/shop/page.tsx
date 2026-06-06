import { Suspense } from "react";
import ShopContent from "./ShopContent";
import { PageLoader } from "@/components/shared/ui";

export default function ShopPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ShopContent />
    </Suspense>
  );
}
