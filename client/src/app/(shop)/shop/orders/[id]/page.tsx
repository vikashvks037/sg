"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Order } from "@/types";
import { Button } from "@/components/shared/Button";
import { Badge, PageLoader } from "@/components/shared/ui";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, formatDate, getOrderStatusColor, getPaymentStatusColor, ORDER_STATUSES } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.get(API.shop.orders.detail(id))
      .then(({ data }) => { if (data.success) setOrder(data.data); })
      .finally(() => setLoading(false));
  }, [id, user, router]);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      const { data } = await api.patch(API.shop.orders.cancel(id));
      if (data.success) { setOrder(data.data); toast.success("Order cancelled"); }
      else toast.error(data.message || "Failed");
    } catch { toast.error("Failed to cancel"); }
    finally { setCancelling(false); }
  };

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const cancelable = ["pending", "confirmed"].includes(order.orderStatus);
  const statusIndex = ORDER_STATUSES.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop/orders"><button className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button></Link>
        <h1 className="text-2xl font-bold font-playfair">Order #{order._id.slice(-8).toUpperCase()}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Status tracker */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Order Status</h2>
              <Badge className={getOrderStatusColor(order.orderStatus)}>
                {order.orderStatus.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <div className="relative">
              <div className="flex justify-between relative z-10">
                {["pending", "confirmed", "shipped", "out_for_delivery", "delivered"].map((s, i) => {
                  const active = statusIndex >= ORDER_STATUSES.indexOf(s);
                  return (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`w-4 h-4 rounded-full border-2 transition ${active ? "bg-[#CF1432] border-[#CF1432]" : "bg-white border-gray-300"}`} />
                      <span className={`text-[10px] text-center capitalize ${active ? "text-[#CF1432] font-medium" : "text-gray-400"}`}>
                        {s.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-2 left-2 right-2 h-0.5 bg-gray-200 -z-0">
                <div
                  className="h-full bg-[#CF1432] transition-all"
                  style={{ width: `${Math.min(100, (statusIndex / 4) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4">Items Ordered</h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.title} className="w-16 h-20 object-cover rounded-xl bg-gray-100" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-5">
          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3">Payment</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="uppercase">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{order.deliveryCharge === 0 ? "FREE" : formatCurrency(order.deliveryCharge)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3">Delivery Address</h3>
            <div className="text-sm text-gray-600 flex flex-col gap-1">
              <p className="font-semibold">{order.addressInfo.fullName}</p>
              <p>{order.addressInfo.address}</p>
              <p>{order.addressInfo.city}, {order.addressInfo.state} - {order.addressInfo.pincode}</p>
              <p>📞 {order.addressInfo.phone}</p>
            </div>
          </div>

          {cancelable && (
            <Button variant="danger" onClick={handleCancel} loading={cancelling} leftIcon={<X className="w-4 h-4" />}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
