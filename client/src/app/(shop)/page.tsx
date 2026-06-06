"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Truck, RefreshCw, Shield, Headphones, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Product, Feature } from "@/types";
import { ProductCard } from "@/components/shared/ProductCard";
import { Button } from "@/components/shared/Button";
import { PageLoader } from "@/components/shared/ui";
import { useSettingsStore } from "@/store/settings-store";
import { useAuthStore } from "@/store/auth-store";
import { CATEGORIES, getCategoryFallback } from "@/lib/utils";

// Static demo banners shown when admin hasn't added features yet
const DEMO_BANNERS = [
  {
    _id: "demo1",
    image: "/banners/banner1.jpg",
    title: "New Season Collection",
    subtitle: "Discover the latest trends in fashion.",
  },
  {
    _id: "demo2",
    image: "/banners/banner2.jpg",
    title: "Women's Fashion",
    subtitle: "Elegant styles for every occasion.",
  },
];

function HeroBanner({ features, appName }: { features: Feature[]; appName: string }) {
  const [active, setActive] = useState(0);
  // Use admin features if available, else fall back to demo banners
  const banners: { _id: string; image: string; title?: string; subtitle?: string }[] =
    features.length > 0
      ? features.map((f) => ({ _id: f._id, image: f.image, title: f.title }))
      : DEMO_BANNERS;

  const go = useCallback((idx: number) => {
    setActive((idx + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative overflow-hidden h-[400px] md:h-[550px] bg-gray-900 select-none">
      {/* Slides */}
      {banners.map((f, i) => (
        <div
          key={f._id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={f.image}
            alt={f.title || "Banner"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <p className="text-white/80 text-sm uppercase tracking-widest mb-3">New Collection</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair leading-tight max-w-lg">
                {f.title || appName}
              </h1>
              <p className="text-white/70 mt-4 mb-8 max-w-md">{(f as any).subtitle || 'Discover the latest trends in fashion. Shop now and express yourself.'}</p>
              <Link href="/shop">
                <Button size="lg" className="rounded-full">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows — only if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => go(active - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(active + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Dots — always visible */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === active ? "bg-white w-7" : "bg-white/50 w-2.5"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettingsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featRes, prodRes, newRes] = await Promise.all([
          api.get(API.common.features),
          api.get(`${API.shop.products.list}?featured=true&limit=8`),
          api.get(`${API.shop.products.list}?limit=8&sortBy=createdAt&sortOrder=desc`),
        ]);
        if (featRes.data.success) setFeatures(featRes.data.data);
        if (prodRes.data.success) setFeatured(prodRes.data.data);
        if (newRes.data.success) setNewArrivals(newRes.data.data);
      } catch {/* silent */}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Hero Carousel */}
      <section className="bg-gray-100">
        <HeroBanner features={features} appName={settings.appName || "SG"} />
      </section>

      {/* Value Props */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Delivery", desc: `On orders above ₹${settings.freeDeliveryThreshold || 999}` },
            { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
            { icon: Shield, title: "Secure Payments", desc: "100% safe checkout" },
            { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#CF1432]" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-playfair">Shop by Category</h2>
            <p className="text-gray-500 mt-2">Explore our wide range of collections</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col items-center"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-2 group-hover:shadow-lg transition-shadow">
                  <img
                    src={getCategoryFallback(cat)}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm font-medium group-hover:text-[#CF1432] transition-colors">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold font-playfair">Featured Products</h2>
                <p className="text-gray-500 mt-1">Hand-picked just for you</p>
              </div>
              <Link href="/shop?featured=true">
                <Button variant="outline" size="sm">View All <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold font-playfair">New Arrivals</h2>
                <p className="text-gray-500 mt-1">Fresh styles, just in</p>
              </div>
              <Link href="/shop">
                <Button variant="outline" size="sm">View All <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner — only for guests */}
      {!user && (
      <section className="py-20 bg-[#CF1432]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-4">
            Get 20% Off Your First Order
          </h2>
          <p className="text-red-100 mb-8">Sign up and discover exclusive deals just for you.</p>
          <Link href="/auth/register">
            <Button variant="outline" size="lg" className="bg-white text-[#CF1432] border-white hover:bg-red-50 rounded-full">
              Create Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
      )}
    </div>
  );
}
