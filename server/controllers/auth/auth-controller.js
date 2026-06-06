const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const User   = require("../../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is not set!");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

const CLEAR_COOKIE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// ── Register ──────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { userName, email, password, phone } = req.body;
  if (!userName || !email || !password)
    return res.status(400).json({ success: false, message: "userName, email, and password are required." });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

  try {
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { userName }] });
    if (existing)
      return res.status(400).json({
        success: false,
        message: existing.email === email.toLowerCase() ? "Email already registered." : "Username already taken.",
      });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ userName, email: email.toLowerCase(), password: hashedPassword, phone: phone || "" });
    await user.save();
    res.status(201).json({ success: true, message: "Account created successfully!" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed. Try again." });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required." });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)    return res.status(400).json({ success: false, message: "No account found with this email." });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account is deactivated." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password." });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, userName: user.userName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS).json({
      success: true,
      message: "Logged in successfully!",
      user: { id: user._id, email: user.email, role: user.role, userName: user.userName },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed. Try again." });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logoutUser = (req, res) => {
  res.clearCookie("token", CLEAR_COOKIE).json({ success: true, message: "Logged out successfully." });
};

// ── Check auth ────────────────────────────────────────────────────────────────
const checkAuth = async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ success: false, user: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      res.clearCookie("token", CLEAR_COOKIE);
      return res.json({ success: false, user: null });
    }
    res.json({
      success: true,
      user: { id: user._id, email: user.email, role: user.role, userName: user.userName },
    });
  } catch {
    res.clearCookie("token", CLEAR_COOKIE);
    res.json({ success: false, user: null });
  }
};

// ── Forgot password ───────────────────────────────────────────────────────────
// Generates a reset token and returns it directly (no email service required).
// In production, send this token via email instead of returning it in the response.
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required." });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond with success to avoid email enumeration
    if (!user) return res.json({ success: true, message: "If this email is registered, a reset link has been sent." });

    const resetToken  = crypto.randomBytes(32).toString("hex");
    const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    user.passwordResetToken  = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpiry = resetExpiry;
    await user.save();

    // TODO: send email with resetToken. For now, returned directly for dev use.
    res.json({
      success: true,
      message: "If this email is registered, a reset link has been sent.",
      // Remove `resetToken` from response in production — send via email instead
      resetToken,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Failed to process request." });
  }
};

// ── Reset password ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ success: false, message: "Token and newPassword are required." });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken:  hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });

    user.password             = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken   = undefined;
    user.passwordResetExpiry  = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Please login." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Failed to reset password." });
  }
};

module.exports = { registerUser, loginUser, logoutUser, checkAuth, forgotPassword, resetPassword };
