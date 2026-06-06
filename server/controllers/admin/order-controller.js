const Order = require("../../models/Order");
const User = require("../../models/User");

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "userName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, data: orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "userName email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus: status, note, trackingId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    order.orderStatus = status;
    if (trackingId) order.trackingId = trackingId;
    order.statusHistory.push({ status, note: note || "", timestamp: new Date() });
    order.orderUpdateDate = new Date();

    // Auto-update payment status on delivery
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus };
