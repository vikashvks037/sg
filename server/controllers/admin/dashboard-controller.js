const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders, monthOrders, lastMonthOrders,
      totalRevenue, monthRevenue,
      totalUsers, monthUsers,
      totalProducts, lowStockProducts,
      recentOrders, orderStatusCounts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ totalStock: { $lt: 10 }, isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("userId", "userName email"),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    ]);

    // Monthly revenue chart (last 6 months)
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          monthOrders,
          orderGrowth: lastMonthOrders ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1) : 0,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthRevenue: monthRevenue[0]?.total || 0,
          totalUsers,
          monthUsers,
          totalProducts,
          lowStockProducts,
        },
        recentOrders,
        orderStatusCounts,
        monthlyRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data." });
  }
};

module.exports = { getDashboardStats };
