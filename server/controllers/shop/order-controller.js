const Order   = require("../../models/Order");
const Cart    = require("../../models/Cart");
const Product = require("../../models/Product");
const Settings = require("../../models/Settings");
const { createRazorpayOrder, verifyRazorpaySignature } = require("../../helpers/razorpay");

const COD_METHODS    = ["cod"];
const ONLINE_METHODS = ["upi", "card", "netbanking", "wallet"];

/** Read delivery settings from DB (with sensible defaults) */
const getDeliverySettings = async () => {
  const docs = await Settings.find({ key: { $in: ["freeDeliveryThreshold", "deliveryCharge"] } });
  const map = {};
  docs.forEach((d) => { map[d.key] = d.value; });
  return {
    freeDeliveryThreshold: Number(map.freeDeliveryThreshold ?? 500),
    deliveryCharge:        Number(map.deliveryCharge        ?? 49),
  };
};

/** Build cart snapshot + totals for order creation */
const buildOrderItems = async (cart) => {
  const { freeDeliveryThreshold, deliveryCharge } = await getDeliverySettings();

  const items = cart.items.map((item) => ({
    productId: item.productId._id,
    title:     item.productId.title,
    image:
      item.productId.media?.find((m) => m.isPrimary)?.url ||
      item.productId.media?.[0]?.url ||
      "https://placehold.co/200x200?text=No+Image",
    price:    item.productId.salePrice > 0 ? item.productId.salePrice : item.productId.price,
    quantity: item.quantity,
  }));

  const subtotal      = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping      = subtotal >= freeDeliveryThreshold ? 0 : deliveryCharge;
  const totalAmount   = subtotal + shipping;

  return { items, subtotal, deliveryCharge: shipping, totalAmount };
};

// ─── POST /api/shop/order/razorpay-order ─────────────────────────────────────
const createRazorpayOrderHandler = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty." });

    for (const item of cart.items) {
      if (!item.productId?.isActive)
        return res.status(400).json({ success: false, message: `${item.productId?.title || "A product"} is no longer available.` });
      if (item.productId.totalStock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.productId.title}.` });
    }

    const { totalAmount } = await buildOrderItems(cart);
    const receipt = `rcpt_${req.user.id}_${Date.now()}`;
    const rzpOrder = await createRazorpayOrder(totalAmount, receipt);

    res.json({
      success:         true,
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[createRazorpayOrder error]", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to initiate payment." });
  }
};

// ─── POST /api/shop/order ─────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      addressInfo, paymentMethod, couponCode, notes,
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = req.body;

    if (ONLINE_METHODS.includes(paymentMethod)) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
        return res.status(400).json({ success: false, message: "Payment verification fields missing." });
      const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid)
        return res.status(400).json({ success: false, message: "Payment verification failed. Please contact support." });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty." });

    for (const item of cart.items) {
      if (!item.productId?.isActive)
        return res.status(400).json({ success: false, message: `${item.productId?.title || "A product"} is no longer available.` });
      if (item.productId.totalStock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.productId.title}.` });
    }

    const { items, subtotal, deliveryCharge, totalAmount } = await buildOrderItems(cart);

    const order = new Order({
      userId: req.user.id,
      items,
      addressInfo,
      paymentMethod,
      paymentStatus:     COD_METHODS.includes(paymentMethod) ? "pending" : "paid",
      razorpayOrderId:   razorpayOrderId   || "",
      razorpayPaymentId: razorpayPaymentId || "",
      subtotal,
      deliveryCharge,
      totalAmount,
      couponCode:   couponCode || "",
      notes:        notes     || "",
      statusHistory: [{ status: "pending", note: "Order placed", timestamp: new Date() }],
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    await Promise.all(
      cart.items.map((item) =>
        Product.findByIdAndUpdate(item.productId._id, { $inc: { totalStock: -item.quantity } })
      )
    );

    await Cart.findOneAndUpdate({ userId: req.user.id }, { $set: { items: [] } });

    res.status(201).json({ success: true, message: "Order placed successfully!", data: order });
  } catch (err) {
    console.error("[createOrder error]", err?.message, err?.errors || "");
    res.status(500).json({
      success: false,
      message: err?.message?.includes("validation")
        ? "Order validation failed: " + Object.values(err.errors || {}).map((e) => e.message).join(", ")
        : "Failed to place order.",
    });
  }
};

// ─── GET /api/shop/order ──────────────────────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Order.countDocuments({ userId: req.user.id }),
    ]);
    res.json({ success: true, data: orders, total, totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// ─── GET /api/shop/order/:id ──────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

// ─── PATCH /api/shop/order/:id/cancel ────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    if (!["pending", "confirmed"].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage." });

    order.orderStatus = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: "Cancelled by customer", timestamp: new Date() });

    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.productId, { $inc: { totalStock: item.quantity } })
      )
    );

    await order.save();
    res.json({ success: true, message: "Order cancelled." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to cancel order." });
  }
};

// ─── POST /api/shop/order/:id/return ─────────────────────────────────────────
const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    if (order.orderStatus !== "delivered")
      return res.status(400).json({ success: false, message: "Only delivered orders can be returned." });
    if (order.returnRequested)
      return res.status(400).json({ success: false, message: "Return already requested." });

    order.returnRequested = true;
    order.returnReason    = reason || "";
    order.orderStatus     = "returned";
    order.statusHistory.push({ status: "returned", note: `Return requested: ${reason || "No reason given"}`, timestamp: new Date() });

    await order.save();
    res.json({ success: true, message: "Return request submitted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit return request." });
  }
};

module.exports = { createRazorpayOrderHandler, createOrder, getUserOrders, getOrderById, cancelOrder, requestReturn };
