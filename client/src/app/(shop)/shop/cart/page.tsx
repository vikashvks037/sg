"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/shared/Button";
import { PageLoader, Empty } from "@/components/shared/ui";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem } = useCart();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, [fetchCart]);

  if (loading) return <PageLoader />;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.productId?.salePrice > 0 ? item.productId.salePrice : item.productId?.price;
    return sum + (price || 0) * item.quantity;
  }, 0);
  const threshold = settings.freeDeliveryThreshold || 999;
  const deliveryCharge = subtotal >= threshold ? 0 : (settings.deliveryCharge || 49);
  const total = subtotal + deliveryCharge;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold font-playfair mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <Empty
          title="Your cart is empty"
          description="Browse our products and add items to your cart"
          action={
            <Link href="/shop">
              <Button leftIcon={<ShoppingBag className="w-4 h-4" />}>Continue Shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => {
              const prod = item.productId;
              const price = prod?.salePrice > 0 ? prod.salePrice : prod?.price;
              return (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                  <Link href={`/shop/products/${prod?._id}`} className="flex-shrink-0">
                    <img
                      src={getProductImage(prod)}
                      alt={prod?.title}
                      className="w-24 h-28 object-cover rounded-xl bg-gray-100"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/products/${prod?._id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-[#CF1432] transition line-clamp-2">{prod?.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-400 mt-1">{prod?.category}</p>
                    <p className="font-bold text-gray-900 mt-2">{formatCurrency(price || 0)}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateItem(String(prod._id), item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-100 transition text-sm"
                        >-</button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(String(prod._id), item.quantity + 1)}
                          disabled={item.quantity >= prod?.totalStock}
                          className="px-3 py-1.5 hover:bg-gray-100 transition text-sm disabled:opacity-40"
                        >+</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#CF1432]">{formatCurrency((price || 0) * item.quantity)}</span>
                        <button
                          onClick={() => removeItem(String(prod._id))}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({items.length} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryCharge === 0 ? "FREE" : formatCurrency(deliveryCharge)}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-[#CF1432]">
                    Add {formatCurrency(threshold - subtotal)} more for free delivery!
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {user ? (
                <Link href="/shop/checkout">
                  <Button size="lg" className="w-full mt-5 rounded-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button size="lg" className="w-full mt-5 rounded-full">Login to Checkout</Button>
                </Link>
              )}

              <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
