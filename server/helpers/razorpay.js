const Razorpay = require("razorpay");
const crypto   = require("crypto");

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/**
 * Create a Razorpay order
 * @param {number} amountInRupees
 * @param {string} receiptId - unique receipt id (our internal order ref)
 */
const createRazorpayOrder = async (amountInRupees, receiptId) => {
  const instance = getRazorpayInstance();
  const order = await instance.orders.create({
    amount:   Math.round(amountInRupees * 100), // paise
    currency: "INR",
    receipt:  receiptId,
  });
  return order;
};

/**
 * Verify Razorpay payment signature
 * Returns true if signature is valid
 */
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body      = razorpayOrderId + "|" + razorpayPaymentId;
  const expected  = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expected === razorpaySignature;
};

module.exports = { createRazorpayOrder, verifyRazorpaySignature };
