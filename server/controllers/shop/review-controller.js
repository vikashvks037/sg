const Review = require("../../models/Review");
const Order = require("../../models/Order");
const Product = require("../../models/Product");

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ success: true, data: reviews, averageRating: avgRating.toFixed(1), totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews." });
  }
};

const addReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    // Check verified purchase
    const verifiedOrder = await Order.findOne({
      userId: req.user.id,
      "items.productId": productId,
      orderStatus: "delivered",
    });

    const review = new Review({
      productId, userId: req.user.id, userName: req.user.userName,
      rating, title: title || "", comment,
      isVerifiedPurchase: !!verifiedOrder,
    });
    await review.save();

    // Update product average
    const allReviews = await Review.find({ productId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, { averageReview: avg.toFixed(1), totalReviews: allReviews.length });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "You have already reviewed this product." });
    res.status(500).json({ success: false, message: "Failed to add review." });
  }
};

module.exports = { getProductReviews, addReview };
