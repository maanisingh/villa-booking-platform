const mongoose = require("mongoose");

// Define schema for Admin/Owner login
const loginSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [3, "Password must be at least 3 characters long"],
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    assignedVilla: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Inactive"],
      default: "Pending",
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "owner"],
      default: "owner",
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Login", loginSchema);
