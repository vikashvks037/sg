const express = require("express");
const router = express.Router();
const { getAddresses, addAddress, updateAddress, deleteAddress } = require("../../controllers/shop/address-controller");
const { authMiddleware } = require("../../middleware/auth");

router.use(authMiddleware);
router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
