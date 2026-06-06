const Feature = require("../../models/Feature");

const getFeatures = async (req, res) => {
  try {
    const features = await Feature.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: features });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch features." });
  }
};

const addFeature = async (req, res) => {
  try {
    const feature = new Feature(req.body);
    await feature.save();
    res.status(201).json({ success: true, data: feature });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add feature." });
  }
};

const updateFeature = async (req, res) => {
  try {
    const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feature) return res.status(404).json({ success: false, message: "Feature not found." });
    res.json({ success: true, data: feature });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update feature." });
  }
};

const deleteFeature = async (req, res) => {
  try {
    await Feature.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Feature deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete feature." });
  }
};

const setPrimaryFeature = async (req, res) => {
  try {
    // Unset all, then set this one as order=0 (first)
    await Feature.updateMany({}, { $set: { order: 1 } });
    const feature = await Feature.findByIdAndUpdate(
      req.params.id,
      { $set: { order: 0 } },
      { new: true }
    );
    if (!feature) return res.status(404).json({ success: false, message: "Feature not found." });
    res.json({ success: true, data: feature, message: "Set as primary banner." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to set primary feature." });
  }
};

module.exports = { getFeatures, addFeature, updateFeature, deleteFeature, setPrimaryFeature };
