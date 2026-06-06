import React from "react";
import { cn } from "@/lib/utils";
import { PackageSearch, Loader2 } from "lucide-react";

// Badge
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}
export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", className)}>
      {children}
    </span>
  );
}

// Spinner
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("w-6 h-6 animate-spin text-[#CF1432]", className)} />;
}

// PageLoader
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="w-10 h-10" />
    </div>
  );
}

// Empty State
interface EmptyProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}
export function Empty({ title = "No data found", description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <PackageSearch className="w-16 h-16 text-gray-300" />
      <div>
        <p className="text-lg font-semibold text-gray-600">{title}</p>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// Pagination
interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}
export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={cn(
            "w-9 h-9 rounded-md text-sm font-medium transition",
            p === page ? "bg-[#CF1432] text-white" : "border hover:bg-gray-50"
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
      >
        Next
      </button>
    </div>
  );
}

// Star Rating
export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={cn("w-4 h-4", i < Math.floor(rating) ? "text-amber-400" : "text-gray-200")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
