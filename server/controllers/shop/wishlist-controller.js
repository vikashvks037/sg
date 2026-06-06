const Wishlist = require("../../models/Wishlist");

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate(
      "products",
      "title price salePrice media totalStock averageReview totalReviews category"
    );
    res.json({ success: true, data: wishlist?.products || [] });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch wishlist." });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId required." });

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id, products: [productId] });
      await wishlist.save();
      return res.json({ success: true, added: true, message: "Added to wishlist." });
    }

    const idx = wishlist.products.findIndex((p) => p.toString() === productId);
    if (idx === -1) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ success: true, added: true, message: "Added to wishlist." });
    } else {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
      return res.json({ success: true, added: false, message: "Removed from wishlist." });
    }
  } catch {
    res.status(500).json({ success: false, message: "Failed to update wishlist." });
  }
};

module.exports = { getWishlist, toggleWishlist };
