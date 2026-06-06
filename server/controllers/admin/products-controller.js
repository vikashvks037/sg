const Product = require("../../models/Product");
const { deleteFromSupabase } = require("../../helpers/supabase");

/** Extract Supabase storage path from a public URL */
const extractStoragePath = (url) => {
  try {
    const marker = "/object/public/";
    const idx    = url.indexOf(marker);
    if (idx === -1) return null;
    // path after bucket name
    const afterMarker = url.slice(idx + marker.length);
    const slashIdx    = afterMarker.indexOf("/");
    return slashIdx === -1 ? null : afterMarker.slice(slashIdx + 1);
  } catch {
    return null;
  }
};

/** Generate a simple SKU: CAT-XXXXXXXX */
const generateSKU = (category) => {
  const prefix = (category || "PRD").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  const rand   = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${rand}`;
};

const addProduct = async (req, res) => {
  try {
    const {
      title, description, shortDescription, category, subCategory,
      brand, price, salePrice, totalStock, tags, specifications,
      isFeatured, media, sku,
    } = req.body;

    const product = new Product({
      title, description,
      shortDescription: shortDescription || "",
      category, subCategory,
      brand:         brand        || "",
      price,
      salePrice:     salePrice    || 0,
      totalStock,
      tags:          tags         || [],
      specifications: specifications || [],
      isFeatured:    isFeatured   || false,
      media:         media        || [],
      sku:           sku          || generateSKU(category),
    });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add product." });
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, isActive } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search)   query.title    = { $regex: search, $options: "i" };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);
    res.json({ success: true, data: products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch products." });
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update product." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    // Delete all associated images from Supabase storage
    if (product.media?.length) {
      const deletions = product.media
        .map((m) => extractStoragePath(m.url))
        .filter(Boolean)
        .map((path) => deleteFromSupabase(path).catch((e) => console.warn("Storage delete failed:", e.message)));
      await Promise.all(deletions);
    }

    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to toggle status." });
  }
};

module.exports = { addProduct, fetchAllProducts, editProduct, deleteProduct, toggleProductStatus };
