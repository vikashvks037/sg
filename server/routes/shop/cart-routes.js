const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../../controllers/shop/cart-controller");
const { authMiddleware } = require("../../middleware/auth");

router.use(authMiddleware);

// GET    /api/shop/cart
// POST   /api/shop/cart
// PUT    /api/shop/cart
// DELETE /api/shop/cart/:productId
// DELETE /api/shop/cart

router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:productId", removeFromCart);

module.exports = router;
