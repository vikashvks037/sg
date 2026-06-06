// admin-middleware.js — re-exports adminMiddleware for backward-compat require paths
const { adminMiddleware } = require("./auth");
module.exports = adminMiddleware;
