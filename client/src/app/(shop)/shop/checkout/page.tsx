"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle, Banknote, Smartphone, CreditCard, Building2, Wallet } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Address } from "@/types";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { PageLoader } from "@/components/shared/ui";
import { Modal } from "@/components/shared/Modal";
import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";
import { formatCurrency, getProductImage, getCategoryFallback } from "@/lib/utils";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { label: "Cash on Delivery", value: "cod",        icon: Banknote,   desc: "Pay when your order arrives" },
  { label: "UPI",              value: "upi",        icon: Smartphone, desc: "GPay, PhonePe, Paytm & more" },
  { label: "Credit / Debit Card", value: "card",   icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { label: "Net Banking",      value: "netbanking", icon: Building2,  desc: "All major banks supported" },
  { label: "Wallet",           value: "wallet",     icon: Wallet,     desc: "Mobikwik, Freecharge & more" },
];

const ONLINE_METHODS = ["upi", "card", "netbanking", "wallet"];

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { cart, fetchCart, clearCart } = useCart();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [addAddrOpen, setAddAddrOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    const fetchAll = async () => {
      await fetchCart();
      const { data } = await api.get(API.shop.address.list);
      if (data.success) { setAddresses(data.data); if (data.data.length > 0) setSelectedAddr(data.data[0]._id); }
      setLoading(false);
    };
    fetchAll();
  }, [user, router, fetchCart]);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => {
    const price = item.productId?.salePrice > 0 ? item.productId.salePrice : item.productId?.price;
    return sum + (price || 0) * item.quantity;
  }, 0);
  const threshold = settings.freeDeliveryThreshold || 999;
  const deliveryCharge = subtotal >= threshold ? 0 : (settings.deliveryCharge || 49);
  const total = subtotal + deliveryCharge;

  const handleAddAddress = async () => {
    try {
      const { data } = await api.post(API.shop.address.create, addrForm);
      if (data.success) {
        const res = await api.get(API.shop.address.list);
        setAddresses(res.data.data);
        setSelectedAddr(res.data.data[res.data.data.length - 1]._id);
        setAddAddrOpen(false);
        toast.success("Address added!");
      } else toast.error(data.message || "Failed");
    } catch { toast.error("Failed to add address"); }
  };

  // Handle online payment via Razorpay
  const handleRazorpayPayment = async (): Promise<{ razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string } | null> => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway. Please try again.");
      return null;
    }

    // Create Razorpay order on backend
    const { data } = await api.post(API.shop.orders.razorpay);
    if (!data.success) {
      toast.error(data.message || "Failed to initiate payment.");
      return null;
    }

    return new Promise((resolve) => {
      const addr = addresses.find((a) => a._id === selectedAddr);
      const options = {
        key:      data.keyId,
        amount:   data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name:     settings.appName || "SG Store",
        description: "Order Payment",
        prefill: {
          name:    addr?.fullName || user?.userName || "",
          contact: addr?.phone || "",
        },
        theme: { color: "#CF1432" },
        handler: (response: any) => {
          resolve({
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => resolve(null),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        resolve(null);
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error("Please select an address"); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    setPlacing(true);
    try {
      const addr = addresses.find((a) => a._id === selectedAddr)!;
      let razorpayFields: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string } | null = null;

      // If online payment, open Razorpay checkout first
      if (ONLINE_METHODS.includes(paymentMethod)) {
        razorpayFields = await handleRazorpayPayment();
        if (!razorpayFields) {
          setPlacing(false);
          return; // User cancelled or payment failed
        }
      }

      const { data } = await api.post(API.shop.orders.create, {
        addressInfo:      { addressId: addr._id, ...addr },
        paymentMethod,
        ...(razorpayFields || {}),
      });

      if (data.success) {
        await clearCart();
        toast.success("Order placed successfully!");
        router.push(`/shop/orders/${data.data._id}`);
      } else {
        toast.error(data.message || "Order failed");
      }
    } catch {
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold font-playfair mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Delivery Address</h2>
              <Button size="sm" variant="outline" onClick={() => setAddAddrOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Add New
              </Button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-gray-400 text-sm">No addresses saved. Add one to continue.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {addresses.map((addr) => (
                  <label key={addr._id} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddr === addr._id ? "border-[#CF1432] bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="address" value={addr._id} checked={selectedAddr === addr._id} onChange={() => setSelectedAddr(addr._id)} className="accent-[#CF1432] mt-1" />
                    <div>
                      <p className="font-semibold text-sm">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-500">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method — radio cards */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map(({ label, value, icon: Icon, desc }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === value
                      ? "border-[#CF1432] bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="accent-[#CF1432]"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === value ? "bg-[#CF1432] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 mb-5">
              {items.map((item) => {
                const prod = item.productId;
                const price = prod?.salePrice > 0 ? prod.salePrice : prod?.price;
                return (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={getProductImage(prod)} alt={prod?.title} className="w-12 h-14 object-cover rounded-lg bg-gray-100"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = getCategoryFallback(prod?.category); }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{prod?.title}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency((price || 0) * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={deliveryCharge === 0 ? "text-green-600 font-medium" : ""}>{deliveryCharge === 0 ? "FREE" : formatCurrency(deliveryCharge)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            {/* Show Razorpay badge for online methods */}
            {ONLINE_METHODS.includes(paymentMethod) && (
              <p className="text-xs text-gray-400 text-center mt-3">
                🔒 Secured by Razorpay
              </p>
            )}

            <Button onClick={handlePlaceOrder} loading={placing} size="lg" className="w-full mt-5 rounded-full" leftIcon={<CheckCircle className="w-5 h-5" />}>
              {ONLINE_METHODS.includes(paymentMethod) ? "Pay Now" : "Place Order"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal open={addAddrOpen} onClose={() => setAddAddrOpen(false)} title="Add New Address">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={addrForm.fullName} onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })} />
          <Input label="Phone" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
          <Input label="Address" value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
            <Input label="State" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} />
          </div>
          <Input label="Pincode" value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} />
          <Button onClick={handleAddAddress} className="mt-2">Save Address</Button>
        </div>
      </Modal>
    </div>
  );
}
