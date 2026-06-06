const express = require("express");
const router  = express.Router();
const { getSettings, saveBrand, saveStore, saveFooter } = require("../../controllers/common/settings-controller");
const adminMiddleware = require("../../middleware/admin-middleware");

// Public — every page needs logo / appName / delivery settings
router.get("/", getSettings);

// Admin — one route per settings section
router.put("/brand",  adminMiddleware, saveBrand);   // logo + appName
router.put("/store",  adminMiddleware, saveStore);   // phone + delivery charges
router.put("/footer", adminMiddleware, saveFooter);  // all footer fields

module.exports = router;
