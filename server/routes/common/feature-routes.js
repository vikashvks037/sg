const express = require("express");
const router = express.Router();
const { getFeatures, addFeature, updateFeature, deleteFeature, setPrimaryFeature } = require("../../controllers/common/feature-controller");
const { adminMiddleware } = require("../../middleware/auth");

router.get("/", getFeatures); // public
router.post("/", adminMiddleware, addFeature);
router.put("/:id", adminMiddleware, updateFeature);
router.patch("/:id/primary", adminMiddleware, setPrimaryFeature);
router.delete("/:id", adminMiddleware, deleteFeature);

module.exports = router;
