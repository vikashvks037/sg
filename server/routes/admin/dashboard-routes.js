const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../../controllers/admin/dashboard-controller");
const { adminMiddleware } = require("../../middleware/auth");

router.use(adminMiddleware);
router.get("/", getDashboardStats);

module.exports = router;
