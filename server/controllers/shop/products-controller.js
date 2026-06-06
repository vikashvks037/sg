const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category, subCategory, minPrice, maxPrice, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 12, featured, q } = req.query;
    const query = { isActive: true };
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }
    if (category) query.category = { $in: Array.isArray(category) ? category : [category] };
    if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (featured === "true") query.isFeatured = true;

    const sortObj = {};
    if (sortBy === "price_asc") { sortObj.price = 1; }
    else if (sortBy === "price_desc") { sortObj.price = -1; }
    else if (sortBy === "rating") { sortObj.averageReview = -1; }
    else { sortObj[sortBy] = sortOrder === "asc" ? 1 : -1; }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, data: products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};

// searchProducts is an alias for getFilteredProducts (used by /api/shop/search?q=...)
const searchProducts = getFilteredProducts;

module.exports = { getFilteredProducts, getProductById, searchProducts };
