"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Eye, Search } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Order } from "@/types";
import { Input } from "@/components/shared/Input";
import { Dropdown } from "@/components/shared/Dropdown";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { PageLoader, Badge, Empty, Pagination } from "@/components/shared/ui";
import { formatCurrency, formatDate, getOrderStatusColor, getPaymentStatusColor, ORDER_STATUSES } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("q", search);
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`${API.admin.orders.list}?${params}`);
      if (data.success) { setOrders(data.data); setTotalPages(data.totalPages || 1); }
    } catch {/* silent */}
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = async (id: string) => {
    const { data } = await api.get(API.admin.orders.detail(id));
    if (data.success) {
      setSelectedOrder(data.data);
      setNewStatus(data.data.orderStatus);
      setTrackingId(data.data.trackingId || "");
      setStatusNote("");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const { data } = await api.patch(API.admin.orders.updateStatus(selectedOrder._id), {
        orderStatus: newStatus,
        note: statusNote,
        trackingId,
      });
      if (data.success) {
        toast.success("Status updated!");
        setSelectedOrder(data.data);
        fetchOrders();
      } else toast.error(data.message || "Failed");
    } catch { toast.error("Failed to update"); }
    finally { setUpdating(false); }
  };

  const STATUS_OPTIONS = [
    { label: "All Statuses", value: "" },
    ...ORDER_STATUSES.map((s) => ({ label: s.replace("_", " ").toUpperCase(), value: s })),
  ];

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<Search className="w-4 h-4" />}
            className="max-w-sm"
          />
          <Dropdown
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            className="w-full sm:w-52"
          />
        </div>

        {loading ? (
          <div className="p-10"><PageLoader /></div>
        ) : orders.length === 0 ? (
          <Empty title="No orders found" />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Items</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Payment</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3 text-sm font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {typeof order.userId === "object" ? order.userId.userName : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-3 text-sm">{order.items.length}</td>
                      <td className="px-5 py-3 text-sm font-semibold">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-5 py-3">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={getOrderStatusColor(order.orderStatus)}>
                          {order.orderStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openDetail(order._id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order._id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">#{order._id.slice(-6).toUpperCase()}</span>
                      <Badge className={getOrderStatusColor(order.orderStatus)}>
                        {order.orderStatus.replace("_", " ")}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {typeof order.userId === "object" ? order.userId.userName : "—"} · {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm font-semibold text-[#CF1432] mt-0.5">
                      {formatCurrency(order.totalAmount)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => openDetail(order._id)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition flex-shrink-0"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Order Detail Modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?._id.slice(-8).toUpperCase()}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6">
            {/* Items */}
            <div>
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="flex flex-col gap-3">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center border border-gray-100 rounded-xl p-3">
                    <img src={item.image} alt={item.title} className="w-14 h-16 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Payment */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-2">Delivery Address</h3>
                <p className="text-sm font-medium">{selectedOrder.addressInfo.fullName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.addressInfo.address}</p>
                <p className="text-sm text-gray-600">{selectedOrder.addressInfo.city}, {selectedOrder.addressInfo.state} – {selectedOrder.addressInfo.pincode}</p>
                <p className="text-sm text-gray-600">📞 {selectedOrder.addressInfo.phone}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-2">Payment Details</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="uppercase font-medium">{selectedOrder.paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span>
                    <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</Badge>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{selectedOrder.deliveryCharge === 0 ? "FREE" : formatCurrency(selectedOrder.deliveryCharge)}</span></div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(selectedOrder.discount)}</span></div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total</span><span>{formatCurrency(selectedOrder.totalAmount)}</span></div>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3">Update Order Status</h3>
              <div className="flex flex-col gap-3">
                <Dropdown
                  options={ORDER_STATUSES.map((s) => ({ label: s.replace("_", " ").toUpperCase(), value: s }))}
                  value={newStatus}
                  onChange={setNewStatus}
                />
                <Input
                  placeholder="Tracking ID (optional)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
                <Input
                  placeholder="Note (optional)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <Button onClick={handleUpdateStatus} loading={updating} size="sm">
                  Update Status
                </Button>
              </div>
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory?.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Status History</h3>
                <div className="flex flex-col gap-2">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#CF1432] mt-1.5 flex-shrink-0" />
                      <div>
                        <Badge className={getOrderStatusColor(h.status)}>{h?.status?.replace("_", " ") ?? ""}</Badge>
                        {h.note && <p className="text-gray-500 text-xs mt-0.5">{h.note}</p>}
                        <p className="text-gray-400 text-xs">{formatDate(h.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
