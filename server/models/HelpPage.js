const mongoose = require("mongoose");

const HelpPageSchema = new mongoose.Schema(
  {
    slug:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    label:   { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    order:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpPage", HelpPageSchema);
