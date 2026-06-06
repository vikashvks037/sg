const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], default: "image" },
  isPrimary: { type: Boolean, default: false },
});

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    media: [MediaSchema],          // images + videos via Supabase
    category: { type: String, required: true },
    subCategory: { type: String, default: "" },
    brand: { type: String, default: "" },
    sku: { type: String, unique: true, sparse: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    totalStock: { type: Number, required: true, default: 0, min: 0 },
    averageReview: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    specifications: [{ key: String, value: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: primary image
ProductSchema.virtual("primaryImage").get(function () {
  const primary = this.media.find((m) => m.isPrimary && m.type === "image");
  return primary ? primary.url : (this.media[0]?.url || "");
});

module.exports = mongoose.model("Product", ProductSchema);
