const express = require("express");
const router = express.Router();
const { searchProducts } = require("../../controllers/shop/products-controller");

// GET /api/shop/search?q=keyword
router.get("/", searchProducts);

module.exports = router;
