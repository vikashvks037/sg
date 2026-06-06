const HelpPage = require("../../models/HelpPage");

// slugify helper
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/common/help  → all pages (label + slug only, for footer links)
const listPages = async (req, res) => {
  try {
    const pages = await HelpPage.find({}, "label slug order").sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/common/help/:slug  → full page content
const getPage = async (req, res) => {
  try {
    const page = await HelpPage.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/admin/help  → all pages with full content
const adminListPages = async (req, res) => {
  try {
    const pages = await HelpPage.find({}).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/help
const createPage = async (req, res) => {
  try {
    const { label, content, order } = req.body;
    if (!label?.trim()) return res.status(400).json({ success: false, message: "Label is required" });

    const slug = toSlug(label);
    const exists = await HelpPage.findOne({ slug });
    if (exists) return res.status(400).json({ success: false, message: "A page with this slug already exists" });

    const page = await HelpPage.create({ slug, label: label.trim(), content: content || "", order: order || 0 });
    res.status(201).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/help/:id
const updatePage = async (req, res) => {
  try {
    const { label, content, order } = req.body;
    const update = {};
    if (label !== undefined) {
      if (!label.trim()) return res.status(400).json({ success: false, message: "Label cannot be empty" });
      update.label = label.trim();
      update.slug  = toSlug(label.trim());
    }
    if (content !== undefined) update.content = content;
    if (order   !== undefined) update.order   = Number(order);

    const page = await HelpPage.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/help/:id
const deletePage = async (req, res) => {
  try {
    const page = await HelpPage.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    res.json({ success: true, message: "Page deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listPages, getPage, adminListPages, createPage, updatePage, deletePage };
