"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { DashboardData, Order } from "@/types";
import { PageLoader, Badge } from "@/components/shared/ui";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(API.admin.dashboard)
      .then(({ data: res }) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <div className="text-gray-500 text-center py-20">Failed to load dashboard</div>;

  const { overview, recentOrders, monthlyRevenue } = data;

  const chartData = monthlyRevenue.map((m) => ({
    name: MONTHS[m._id.month - 1],
    Revenue: m.revenue,
    Orders: m.orders,
  }));

  const statCards = [
    { label: "Total Orders", value: overview.totalOrders, sub: `+${overview.monthOrders} this month`, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "Total Revenue", value: formatCurrency(overview.totalRevenue), sub: formatCurrency(overview.monthRevenue) + " this month", icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "Total Users", value: overview.totalUsers, sub: `+${overview.monthUsers} this month`, icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: "Active Products", value: overview.totalProducts, sub: `${overview.lowStockProducts} low stock`, icon: Package, color: "bg-orange-50 text-orange-600", warn: overview.lowStockProducts > 0 },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              {card.warn && <AlertTriangle className="w-4 h-4 text-orange-500" />}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            <p className="text-xs text-[#CF1432] mt-0.5 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Revenue Overview (Last 6 Months)</h2>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={24}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="Revenue" fill="#CF1432" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5">Order Status Breakdown</h2>
          <div className="flex flex-col gap-3">
            {data.orderStatusCounts.map((s) => (
              <div key={s._id} className="flex items-center justify-between">
                <Badge className={getOrderStatusColor(s._id)}>{(s._id || "").replace(/_/g, " ")}</Badge>
                <span className="font-semibold text-sm">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#CF1432] hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="px-6 py-3 text-left">Order</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr></thead>
            <tbody>
              {recentOrders.map((order: Order) => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {typeof order.userId === "object" ? order.userId.userName : "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-3 text-sm font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-3">
                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                      {(order.orderStatus || "").replace(/_/g, " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
