const express = require("express");
const router  = express.Router();
const {
  createRazorpayOrderHandler,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
} = require("../../controllers/shop/order-controller");
const { authMiddleware } = require("../../middleware/auth");

router.use(authMiddleware);

router.post("/razorpay-order", createRazorpayOrderHandler);
router.post("/",               createOrder);
router.get("/",                getUserOrders);
router.get("/:id",             getOrderById);
router.patch("/:id/cancel",    cancelOrder);
router.post("/:id/return",     requestReturn);

module.exports = router;
