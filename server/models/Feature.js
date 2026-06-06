const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["banner", "hero", "promo"], default: "banner" },
    image: { type: String, required: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
