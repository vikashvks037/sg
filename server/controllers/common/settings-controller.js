const Settings = require("../../models/Settings");

// ── Helper: upsert a single key ──────────────────────────────────────────
async function upsertKey(key, value) {
  return Settings.findOneAndUpdate(
    { key },
    { $set: { key, value } },
    { upsert: true, new: true, runValidators: true }
  );
}

// ── Helper: read all settings as a flat map ──────────────────────────────
async function readAll() {
  const docs = await Settings.find({});
  const map  = {};
  docs.forEach((d) => { map[d.key] = d.value; });
  return map;
}

// ════════════════════════════════════════════════════════════════════════════
// GET /api/common/settings  — public, returns full map
// ════════════════════════════════════════════════════════════════════════════
const getSettings = async (req, res) => {
  try {
    res.json({ success: true, data: await readAll() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/common/settings/brand
// body: { appName, logo }
// Saves brand name + logo in one shot
// ════════════════════════════════════════════════════════════════════════════
const saveBrand = async (req, res) => {
  try {
    const { appName, logo } = req.body;
    const ops = [];
    if (appName !== undefined) {
      if (!appName.trim())
        return res.status(400).json({ success: false, message: "appName cannot be empty" });
      ops.push(upsertKey("appName", appName.trim()));
    }
    if (logo !== undefined) ops.push(upsertKey("logo", logo || ""));
    if (ops.length === 0)
      return res.status(400).json({ success: false, message: "Provide appName or logo" });
    await Promise.all(ops);
    res.json({ success: true, data: await readAll() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/common/settings/store
// body: { phone, freeDeliveryThreshold, deliveryCharge }
// ════════════════════════════════════════════════════════════════════════════
const saveStore = async (req, res) => {
  try {
    const { email, phone, freeDeliveryThreshold, deliveryCharge } = req.body;
    const ops = [];
    if (email !== undefined)                 ops.push(upsertKey("email",                  String(email || "").trim()));
    if (phone !== undefined)                 ops.push(upsertKey("phone",                  String(phone || "").trim()));
    if (freeDeliveryThreshold !== undefined) ops.push(upsertKey("freeDeliveryThreshold",  Number(freeDeliveryThreshold) || 0));
    if (deliveryCharge !== undefined)        ops.push(upsertKey("deliveryCharge",          Number(deliveryCharge) || 0));
    if (ops.length === 0)
      return res.status(400).json({ success: false, message: "No store fields provided" });
    await Promise.all(ops);
    res.json({ success: true, data: await readAll() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/common/settings/footer
// body: { contactEmail, contactAddress, copyrightText, bottomLinks,
//         socialLinks: { facebook, twitter, instagram, youtube },
//         aboutLinks, helpLinks }
// Saves entire footer object in one upsert
// ════════════════════════════════════════════════════════════════════════════
const saveFooter = async (req, res) => {
  try {
    const {
      contactEmail, contactAddress,
      copyrightText, bottomLinks,
      socialLinks,
      aboutLinks, helpLinks,
    } = req.body;

    // Load existing footer so we do a deep merge (don't wipe keys not sent)
    const stored  = await Settings.findOne({ key: "footer" });
    const base    = (stored?.value && typeof stored.value === "object") ? stored.value : {};

    const merged = { ...base };
    if (contactEmail   !== undefined) merged.contactEmail   = contactEmail;
    if (contactAddress !== undefined) merged.contactAddress = contactAddress;
    if (copyrightText  !== undefined) merged.copyrightText  = copyrightText;
    if (Array.isArray(bottomLinks))   merged.bottomLinks    = bottomLinks;
    if (Array.isArray(aboutLinks))    merged.aboutLinks     = aboutLinks;
    if (Array.isArray(helpLinks))     merged.helpLinks      = helpLinks;
    if (socialLinks && typeof socialLinks === "object") {
      merged.socialLinks = { ...(base.socialLinks || {}), ...socialLinks };
    }

    await upsertKey("footer", merged);
    res.json({ success: true, data: await readAll() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSettings, saveBrand, saveStore, saveFooter };
