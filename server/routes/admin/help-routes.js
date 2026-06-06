const express = require("express");
const router  = express.Router();
const { adminListPages, createPage, updatePage, deletePage } = require("../../controllers/admin/help-controller");
const adminMiddleware = require("../../middleware/admin-middleware");

router.use(adminMiddleware);

router.get("/",      adminListPages);
router.post("/",     createPage);
router.put("/:id",   updatePage);
router.delete("/:id", deletePage);

module.exports = router;
