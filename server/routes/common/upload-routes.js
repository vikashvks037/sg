const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadToSupabase, deleteFromSupabase } = require("../../helpers/supabase");
const { adminMiddleware } = require("../../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm", "video/quicktime"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images and videos are allowed."), false);
  },
});

// POST /api/upload/media - upload single file
router.post("/media", adminMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const folder = req.body.folder || "products";
    const type = req.file.mimetype.startsWith("video") ? "video" : "image";
    const { url, path } = await uploadToSupabase(req.file.buffer, req.file.mimetype, folder);
    res.json({ success: true, url, path, type });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: err.message || "Upload failed." });
  }
});

// POST /api/upload/media/multiple - upload multiple files
router.post("/media/multiple", adminMiddleware, upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: "No files uploaded." });
    const folder = req.body.folder || "products";
    const results = await Promise.all(
      req.files.map(async (file) => {
        const { url, path } = await uploadToSupabase(file.buffer, file.mimetype, folder);
        return { url, path, type: file.mimetype.startsWith("video") ? "video" : "image" };
      })
    );
    res.json({ success: true, files: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Upload failed." });
  }
});

// DELETE /api/upload/media - delete file
router.delete("/media", adminMiddleware, async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) return res.status(400).json({ success: false, message: "File path required." });
    await deleteFromSupabase(path);
    res.json({ success: true, message: "File deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Delete failed." });
  }
});

module.exports = router;
