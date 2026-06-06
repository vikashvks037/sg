"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Product } from "@/types";
import { ProductCard } from "@/components/shared/ProductCard";
import { Dropdown } from "@/components/shared/Dropdown";
import { Button } from "@/components/shared/Button";
import { PageLoader, Empty, Pagination } from "@/components/shared/ui";
import { CATEGORIES, getSubCategories } from "@/lib/utils";

const SORT_OPTIONS = [
  { label: "Newest First",       value: "createdAt"  },
  { label: "Price: Low to High", value: "price_asc"  },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated",          value: "rating"     },
  { label: "Most Popular",       value: "totalReviews"},
];

const PRICE_PRESETS = [
  { label: "Under ₹500",         min: "",    max: "500"  },
  { label: "₹500 – ₹1,000",      min: "500", max: "1000" },
  { label: "₹1,000 – ₹2,500",    min: "1000",max: "2500" },
  { label: "₹2,500 – ₹5,000",    min: "2500",max: "5000" },
  { label: "Above ₹5,000",        min: "5000",max: ""     },
];

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide group-hover:text-gray-800 transition">{title}</p>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      {open && children}
    </div>
  );
}

export default function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // local price state so user can type before applying
  const [localMin, setLocalMin] = useState("");
  const [localMax, setLocalMax] = useState("");

  const q           = searchParams.get("q")           || "";
  const category    = searchParams.get("category")    || "";
  const subCategory = searchParams.get("subCategory") || "";
  const minPrice    = searchParams.get("minPrice")    || "";
  const maxPrice    = searchParams.get("maxPrice")    || "";
  const sortBy      = searchParams.get("sortBy")      || "createdAt";
  const featured    = searchParams.get("featured")    || "";
  const page        = parseInt(searchParams.get("page") || "1");

  // Sync local price with URL params on load
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }, [searchParams, router]);

  const updateMultiple = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }, [searchParams, router]);

  const handleCategoryClick = (cat: string) => {
    // Reset subCategory when category changes
    updateMultiple({ category: cat, subCategory: "" });
  };

  const applyPriceRange = () => {
    updateMultiple({ minPrice: localMin, maxPrice: localMax });
  };

  const applyPricePreset = (min: string, max: string) => {
    setLocalMin(min);
    setLocalMax(max);
    updateMultiple({ minPrice: min, maxPrice: max });
  };

  const subCategories = getSubCategories(category);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)           params.set("q", q);
      if (category)    params.set("category", category);
      if (subCategory) params.set("subCategory", subCategory);
      if (minPrice)    params.set("minPrice", minPrice);
      if (maxPrice)    params.set("maxPrice", maxPrice);
      if (sortBy)      params.set("sortBy", sortBy);
      if (featured)    params.set("featured", featured);
      params.set("page",  String(page));
      params.set("limit", "12");
      const { data } = await api.get(`${API.shop.products.list}?${params.toString()}`);
      if (data.success) {
        setProducts(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {/* silent */}
    finally { setLoading(false); }
  }, [q, category, subCategory, minPrice, maxPrice, sortBy, featured, page]);

  // Fetch per-category product counts once on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const results = await Promise.all(
          CATEGORIES.map((cat) =>
            api.get(`${API.shop.products.list}?category=${encodeURIComponent(cat)}&limit=1`)
              .then((r) => ({ cat, count: r.data.total || 0 }))
              .catch(() => ({ cat, count: 0 }))
          )
        );
        const counts: Record<string, number> = {};
        results.forEach(({ cat, count }) => { counts[cat] = count; });
        setCategoryCounts(counts);
      } catch {/* silent */}
    };
    fetchCounts();
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const activeFilters = [
    category    && { key: "category",    label: category    },
    subCategory && { key: "subCategory", label: subCategory },
    q           && { key: "q",           label: `"${q}"`    },
    featured    && { key: "featured",    label: "Featured"  },
    minPrice    && { key: "minPrice",    label: `Min ₹${minPrice}` },
    maxPrice    && { key: "maxPrice",    label: `Max ₹${maxPrice}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearAll = () => {
    setLocalMin(""); setLocalMax("");
    router.push("/shop");
  };

  // Sidebar JSX extracted for reuse
  const FilterSidebar = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFilters.length > 0 && (
          <button onClick={clearAll} className="text-xs text-[#CF1432] hover:underline">Clear all</button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <ul className="flex flex-col gap-0.5">
          <li>
            <button onClick={() => handleCategoryClick("")}
              className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition ${!category ? "text-[#CF1432] font-semibold bg-red-50" : "hover:bg-gray-50 text-gray-700"}`}>
              All Categories
            </button>
          </li>
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button onClick={() => handleCategoryClick(cat)}
                className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between ${category === cat ? "text-[#CF1432] font-semibold bg-red-50" : "hover:bg-gray-50 text-gray-700"}`}>
                <span>{cat}</span>
                {categoryCounts[cat] !== undefined && (
                  <span className="text-xs text-gray-400 font-normal">{categoryCounts[cat]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {category && subCategories.length > 0 && (
        <FilterSection title="Sub Category">
          <ul className="flex flex-col gap-0.5">
            <li>
              <button onClick={() => updateParam("subCategory", "")}
                className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between ${!subCategory ? "text-[#CF1432] font-semibold bg-red-50" : "hover:bg-gray-50 text-gray-700"}`}>
                <span>All {category}</span>
                {categoryCounts[category] !== undefined && (
                  <span className="text-xs text-gray-400 font-normal">{categoryCounts[category]}</span>
                )}
              </button>
            </li>
            {subCategories.map((sub) => (
              <li key={sub}>
                <button onClick={() => updateParam("subCategory", sub)}
                  className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition ${subCategory === sub ? "text-[#CF1432] font-semibold bg-red-50" : "hover:bg-gray-50 text-gray-700"}`}>
                  {sub}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        {/* Presets */}
        <div className="flex flex-col gap-1 mb-3">
          {PRICE_PRESETS.map((p) => {
            const active = localMin === p.min && localMax === p.max && (p.min || p.max);
            return (
              <button key={p.label}
                onClick={() => applyPricePreset(p.min, p.max)}
                className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition ${active ? "text-[#CF1432] font-semibold bg-red-50" : "hover:bg-gray-50 text-gray-700"}`}>
                {p.label}
              </button>
            );
          })}
        </div>
        {/* Custom range */}
        <p className="text-xs text-gray-400 mb-2">Custom range</p>
        <div className="flex gap-2 items-center mb-2">
          <input
            type="number"
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#CF1432]"
          />
          <span className="text-gray-400 flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#CF1432]"
          />
        </div>
        <button
          onClick={applyPriceRange}
          className="w-full bg-[#CF1432] text-white text-sm py-1.5 rounded-lg hover:bg-[#b01229] transition font-medium"
        >
          Apply
        </button>
      </FilterSection>

      {/* Featured */}
      <FilterSection title="Other" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer px-2">
          <input
            type="checkbox"
            checked={featured === "true"}
            onChange={(e) => updateParam("featured", e.target.checked ? "true" : "")}
            className="accent-[#CF1432] w-4 h-4"
          />
          <span className="text-sm text-gray-700">Featured Only</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-playfair">
            {q ? `Search: "${q}"` : subCategory || category || "All Products"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilters.length > 0 && <span className="bg-[#CF1432] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{activeFilters.length}</span>}
          </button>
          <Dropdown options={SORT_OPTIONS} value={sortBy} onChange={(v) => updateParam("sortBy", v)} className="w-full sm:w-48" />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {activeFilters.map((f) => (
            <span key={f.key} className="flex items-center gap-1.5 bg-red-50 text-[#CF1432] border border-red-200 rounded-full px-3 py-1 text-xs font-medium">
              {f.label}
              <button onClick={() => {
                if (f.key === "minPrice") setLocalMin("");
                if (f.key === "maxPrice") setLocalMax("");
                updateParam(f.key, "");
              }}><X className="w-3 h-3" /></button>
            </span>
          ))}
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar — desktop only, always visible */}
        <aside className="w-60 flex-shrink-0 hidden sm:block">
          {FilterSidebar}
        </aside>

        {/* Mobile filter drawer — fixed overlay, never affects page layout */}
        <div
          className={`sm:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
            showFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto p-5 transition-transform duration-300 ease-in-out ${
              showFilters ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterSidebar}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <PageLoader />
          ) : products.length === 0 ? (
            <Empty
              title="No products found"
              description="Try adjusting your filters or search term"
              action={<Button onClick={clearAll} variant="outline">Clear Filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={(p) => updateParam("page", String(p))} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
