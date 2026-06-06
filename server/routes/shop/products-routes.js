const express = require("express");
const router = express.Router();
const { getFilteredProducts, getProductById } = require("../../controllers/shop/products-controller");

// GET /api/shop/products?q=...&category=...&minPrice=...etc
// GET /api/shop/products/:id
router.get("/", getFilteredProducts);
router.get("/:id", getProductById);

module.exports = router;
