const express = require("express");
const router = express.Router();
const { addProduct, fetchAllProducts, editProduct, deleteProduct, toggleProductStatus } = require("../../controllers/admin/products-controller");
const { adminMiddleware } = require("../../middleware/auth");

// All admin routes require admin role
router.use(adminMiddleware);

// endpoints.js reference:
// GET    /api/admin/products
// POST   /api/admin/products
// PUT    /api/admin/products/:id
// DELETE /api/admin/products/:id
// PATCH  /api/admin/products/:id/toggle

router.get("/", fetchAllProducts);
router.post("/", addProduct);
router.put("/:id", editProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/toggle", toggleProductStatus);

module.exports = router;
