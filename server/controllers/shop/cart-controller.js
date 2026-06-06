const Cart    = require("../../models/Cart");
const Product = require("../../models/Product");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate({
      path:   "items.productId",
      select: "title price salePrice media totalStock isActive category brand",
    });
    if (!cart) return res.json({ success: true, data: { items: [] } });

    const validItems = cart.items.filter((item) => item.productId?.isActive);
    res.json({ success: true, data: { ...cart.toObject(), items: validItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch cart." });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required." });

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    if (product.totalStock < quantity)
      return res.status(400).json({ success: false, message: "Insufficient stock." });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existingIdx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > product.totalStock)
        return res.status(400).json({ success: false, message: "Exceeds available stock." });
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "title price salePrice media totalStock isActive category brand",
    });
    const validItems = updatedCart.items.filter((item) => item.productId?.isActive);
    res.json({ success: true, message: "Added to cart!", data: { ...updatedCart.toObject(), items: validItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add to cart." });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required." });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart." });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    } else {
      // Stock validation (was missing before)
      const product = await Product.findOne({ _id: productId, isActive: true });
      if (!product) return res.status(404).json({ success: false, message: "Product not found." });
      if (quantity > product.totalStock)
        return res.status(400).json({ success: false, message: `Only ${product.totalStock} units available.` });
      item.quantity = quantity;
    }

    await cart.save();
    // Return populated cart so frontend has price/title/media data
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "title price salePrice media totalStock isActive category brand",
    });
    const validItems = updatedCart.items.filter((item) => item.productId?.isActive);
    res.json({ success: true, data: { ...updatedCart.toObject(), items: validItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update cart." });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });
    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    await cart.save();
    // Populate and return updated cart so frontend stays in sync
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "title price salePrice media totalStock isActive category brand",
    });
    const validItems = updatedCart.items.filter((item) => item.productId?.isActive);
    res.json({ success: true, message: "Removed from cart.", data: { ...updatedCart.toObject(), items: validItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove item." });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.id }, { $set: { items: [] } });
    res.json({ success: true, message: "Cart cleared." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
