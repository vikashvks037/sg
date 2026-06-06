"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, Star, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Heart } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Product, Review } from "@/types";
import { Button } from "@/components/shared/Button";
import { StarRating, PageLoader, Badge } from "@/components/shared/ui";
import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuthStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { settings } = useSettingsStore();
  const wishlisted = product ? isWishlisted(product._id) : false;

  const handleWishlist = () => {
    if (!user) { toast.error("Please login to use wishlist"); return; }
    toggle(product!._id);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(API.shop.products.detail(id)),
          api.get(API.shop.reviews.list(id)),
        ]);
        if (prodRes.data.success) setProduct(prodRes.data.data);
        if (revRes.data.success) setReviews(revRes.data.data);
      } catch {/* silent */}
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleAddReview = async () => {
    if (!user) { toast.error("Please login to review"); return; }
    if (!reviewText.trim()) { toast.error("Write your review"); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(API.shop.reviews.add, { productId: id, rating: reviewRating, comment: reviewText });
      if (data.success) {
        toast.success("Review submitted!");
        setReviewText("");
        setReviewRating(5);
        const revRes = await api.get(API.shop.reviews.list(id));
        if (revRes.data.success) setReviews(revRes.data.data);
      } else toast.error(data.message || "Failed");
    } catch { toast.error("Failed to submit"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <PageLoader />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const images = product.media?.filter((m) => m.type === "image") || [];
  const hasDiscount = product.salePrice > 0 && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
            {images.length > 0 ? (
              <img src={images[activeImg]?.url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">No image</div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-2">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-2">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${i === activeImg ? "border-[#CF1432]" : "border-transparent"}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-gray-100 text-gray-600">{product.category}</Badge>
            {product.isFeatured && <Badge className="bg-red-50 text-[#CF1432]">Featured</Badge>}
            {product.totalStock === 0 && <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-playfair mb-3">{product.title}</h1>

          {product.averageReview > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.averageReview} />
              <span className="text-sm text-gray-500">({product.totalReviews} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(displayPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <Badge className="bg-[#CF1432] text-white">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}% off
                </Badge>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Qty + Add to Cart */}
          {product.totalStock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition">-</button>
                <span className="px-4 py-2 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.totalStock, q + 1))} className="px-3 py-2 hover:bg-gray-100 transition">+</button>
              </div>
              <span className="text-xs text-gray-500">{product.totalStock} in stock</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={() => addToCart(product._id, qty)}
              disabled={product.totalStock === 0}
              size="lg"
              className="flex-1 sm:flex-none rounded-full"
              leftIcon={<ShoppingCart className="w-5 h-5" />}
            >
              {product.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <button
              onClick={handleWishlist}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                wishlisted
                  ? "border-[#CF1432] bg-red-50"
                  : "border-gray-200 hover:border-[#CF1432]"
              }`}
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-[#CF1432] text-[#CF1432]" : "text-gray-400"}`} />
            </button>
          </div>

          {/* Value props */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600"><Truck className="w-4 h-4 text-[#CF1432]" /> Free delivery on orders above ₹{settings.freeDeliveryThreshold || 999}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><RefreshCw className="w-4 h-4 text-[#CF1432]" /> Easy 30-day returns</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-4 h-4 text-[#CF1432]" /> Secure payment</div>
          </div>

          {/* Specs */}
          {product.specifications?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 text-gray-500 w-1/3">{spec.key}</td>
                      <td className="py-2 font-medium">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold font-playfair mb-4">Product Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100">
        <h2 className="text-xl font-bold font-playfair mb-6">
          Reviews ({reviews.length})
        </h2>

        {/* Add review */}
        <div className="border border-gray-200 rounded-xl p-5 mb-8">
          <h3 className="font-semibold mb-3">Write a Review</h3>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map((s) => (
              <button key={s} onClick={() => setReviewRating(s)}>
                <Star className={`w-6 h-6 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#CF1432] resize-none"
          />
          <Button onClick={handleAddReview} loading={submitting} size="sm" className="mt-3">Submit Review</Button>
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-5">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-5 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{r.userName || (typeof r.userId === "object" ? r.userId?.userName : "") || "User"}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
