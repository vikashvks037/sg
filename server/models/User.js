const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
    phone:    { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    passwordResetToken:  { type: String },
    passwordResetExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
