const express = require("express");
const router = express.Router();
const { getWishlist, toggleWishlist } = require("../../controllers/shop/wishlist-controller");
const { authMiddleware } = require("../../middleware/auth");

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

module.exports = router;
