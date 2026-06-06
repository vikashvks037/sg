const express = require("express");
const router  = express.Router();
const { listPages, getPage } = require("../../controllers/admin/help-controller");

router.get("/",      listPages);
router.get("/:slug", getPage);

module.exports = router;
