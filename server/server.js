require("dotenv").config({ override: false });
const express    = require("express");
const mongoose   = require("mongoose");
const cookieParser = require("cookie-parser");
const cors       = require("cors");
const rateLimit  = require("express-rate-limit");

// Route imports
const authRouter          = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter    = require("./routes/admin/order-routes");
const adminDashboardRouter= require("./routes/admin/dashboard-routes");
const shopProductsRouter  = require("./routes/shop/products-routes");
const shopSearchRouter    = require("./routes/shop/search-routes");
const shopCartRouter      = require("./routes/shop/cart-routes");
const shopAddressRouter   = require("./routes/shop/address-routes");
const shopOrderRouter     = require("./routes/shop/order-routes");
const shopReviewRouter    = require("./routes/shop/review-routes");
const shopWishlistRouter  = require("./routes/shop/wishlist-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const commonSettingsRouter= require("./routes/common/settings-routes");
const commonHelpRouter    = require("./routes/common/help-routes");
const adminHelpRouter     = require("./routes/admin/help-routes");
const uploadRouter        = require("./routes/common/upload-routes");

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:       process.env.CLIENT_URL || "http://localhost:3000",
    methods:      ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"],
    credentials:  true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,              // max 20 attempts per window
  message:  { success: false, message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max:      100,
  message:  { success: false, message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",            authLimiter, authRouter);
app.use("/api/admin/products",  adminProductsRouter);
app.use("/api/admin/orders",    adminOrderRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/shop/products",   apiLimiter, shopProductsRouter);
app.use("/api/shop/search",     apiLimiter, shopSearchRouter);
app.use("/api/shop/cart",       shopCartRouter);
app.use("/api/shop/address",    shopAddressRouter);
app.use("/api/shop/order",      shopOrderRouter);
app.use("/api/shop/review",     shopReviewRouter);
app.use("/api/shop/wishlist",   shopWishlistRouter);
app.use("/api/common/feature",  commonFeatureRouter);
app.use("/api/common/settings", commonSettingsRouter);
app.use("/api/common/help",     commonHelpRouter);
app.use("/api/admin/help",      adminHelpRouter);
app.use("/api/upload",          uploadRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", app: "SG API", time: new Date().toISOString() })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
