const express = require("express");
const router  = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  forgotPassword,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.post("/logout",          logoutUser);
router.get("/check",            checkAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

module.exports = router;
