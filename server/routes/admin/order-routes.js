const express = require("express");
const router = express.Router();
const { getAllOrders, getOrderById, updateOrderStatus } = require("../../controllers/admin/order-controller");
const { adminMiddleware } = require("../../middleware/auth");

router.use(adminMiddleware);

// GET    /api/admin/orders
// GET    /api/admin/orders/:id
// PATCH  /api/admin/orders/:id/status

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
