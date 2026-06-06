import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getOrderStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

export function getPaymentStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

// Maps top-level category names to their fallback image in /public
const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  "Clothing":           "/fallbacks/clothing.jpg",
  "Footwear":           "/fallbacks/footwear.jpg",
  "Accessories":        "/fallbacks/accessories.jpg",
  "Mobile":             "/fallbacks/mobile.jpg",
  "Mobile Accessories": "/fallbacks/mobile-accessories.jpg",
  "Electronics":        "/fallbacks/electronics.jpg",
  "Gifts":              "/fallbacks/gifts.jpg",
  "Home & Living":      "/fallbacks/home.jpg",
  "Sports":             "/fallbacks/sports.jpg",
  "Kids":               "/fallbacks/kids.jpg",
};

export function getCategoryFallback(category?: string): string {
  if (!category) return "/fallbacks/default.jpg";
  return CATEGORY_FALLBACK_MAP[category] ?? "/fallbacks/default.jpg";
}

export function getProductImage(product: {
  media?: { url: string; isPrimary?: boolean }[];
  primaryImage?: string;
  category?: string;
}) {
  if (product.primaryImage) return product.primaryImage;
  const primary = product.media?.find((m) => m.isPrimary);
  return primary?.url || product.media?.[0]?.url || getCategoryFallback(product.category);
}

export function productHasRealImage(product: {
  media?: { url: string; isPrimary?: boolean }[];
  primaryImage?: string;
}): boolean {
  if (product.primaryImage) return true;
  return !!(product.media && product.media.length > 0);
}

// ─── Categories & Subcategories ───────────────────────────────────────────────

export const CATEGORY_MAP: Record<string, string[]> = {
  "Clothing": ["Men's Clothing", "Women's Clothing", "Kids' Clothing", "Ethnic Wear", "Winterwear", "Sportswear", "T-Shirts", "Jeans", "Dresses", "Kurtas"],
  "Footwear": ["Men's Footwear", "Women's Footwear", "Kids' Footwear", "Sports Shoes", "Sandals & Slippers", "Formal Shoes", "Boots"],
  "Accessories": ["Bags & Wallets", "Belts", "Sunglasses", "Watches", "Jewellery", "Scarves & Stoles", "Caps & Hats"],
  "Mobile": ["Smartphones", "Feature Phones", "Refurbished Phones"],
  "Mobile Accessories": ["Cases & Covers", "Screen Protectors", "Chargers & Cables", "Earphones & Headphones", "Power Banks", "Bluetooth Speakers", "Smartwatches"],
  "Electronics": ["Laptops & Computers", "Tablets", "Cameras", "TVs & Monitors", "Audio & Video", "Smart Home"],
  "Gifts": ["Gift Sets", "Personalised Gifts", "Hampers", "Greeting Cards", "Seasonal Gifts"],
  "Home & Living": ["Bedding", "Kitchen & Dining", "Decor", "Lighting", "Storage & Organisation"],
  "Sports": ["Gym & Fitness", "Outdoor Sports", "Yoga & Meditation", "Cricket", "Football", "Badminton"],
  "Kids": ["Toys & Games", "School Supplies", "Baby Care", "Kids' Fashion", "Kids' Footwear"],
};

// Flat list of top-level categories
export const CATEGORIES = Object.keys(CATEGORY_MAP);

// Get subcategories for a given category
export function getSubCategories(category: string): string[] {
  return CATEGORY_MAP[category] || [];
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];
