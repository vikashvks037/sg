const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  title:     { type: String, required: true },
  image:     { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:  [OrderItemSchema],
    addressInfo: {
      addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
      fullName:  String,
      phone:     String,
      address:   String,
      city:      String,
      state:     String,
      pincode:   String,
    },
    orderStatus: {
      type:    String,
      enum:    ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    paymentMethod: {
      type:     String,
      enum:     ["cod", "upi", "card", "netbanking", "wallet"],
      required: true,
    },
    paymentStatus: {
      type:    String,
      enum:    ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    subtotal:       { type: Number, required: true },
    discount:       { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount:    { type: Number, required: true },
    couponCode:     { type: String, default: "" },
    notes:          { type: String, default: "" },
    razorpayOrderId:   { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    trackingId:        { type: String, default: "" },
    estimatedDelivery: { type: Date },
    orderDate:         { type: Date, default: Date.now },
    returnRequested:   { type: Boolean, default: false },
    returnReason:      { type: String, default: "" },
    statusHistory: [
      {
        status:    String,
        timestamp: { type: Date, default: Date.now },
        note:      String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
