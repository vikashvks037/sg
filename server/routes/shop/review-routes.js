const express = require("express");
const router = express.Router();
const { getProductReviews, addReview } = require("../../controllers/shop/review-controller");
const { authMiddleware } = require("../../middleware/auth");

router.get("/:productId", getProductReviews);
router.post("/", authMiddleware, addReview);

module.exports = router;
