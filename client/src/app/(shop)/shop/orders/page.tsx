"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Order } from "@/types";
import { PageLoader, Empty, Badge } from "@/components/shared/ui";
import { Button } from "@/components/shared/Button";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";

export default function OrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    api.get(API.shop.orders.list)
      .then(({ data }) => { if (data.success) setOrders(data.data); })
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold font-playfair mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <Empty
          title="No orders yet"
          description="Start shopping to see your orders here"
          action={<Link href="/shop"><Button>Shop Now</Button></Link>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/shop/orders/${order._id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getOrderStatusColor(order.orderStatus)}>
                    {order.orderStatus.replace("_", " ").toUpperCase()}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#CF1432] transition" />
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {order.items.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.title} className="w-12 h-14 object-cover rounded-lg bg-gray-100" />
                ))}
                {order.items.length > 4 && (
                  <div className="w-12 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
