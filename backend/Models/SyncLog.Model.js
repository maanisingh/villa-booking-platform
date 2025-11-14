const mongoose = require("mongoose");

const syncLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    syncType: {
      type: String,
      enum: ["manual", "automatic", "scheduled"],
      default: "manual",
    },
    status: {
      type: String,
      enum: ["success", "partial_success", "failed"],
      required: true,
    },
    newBookings: {
      type: Number,
      default: 0,
    },
    updatedBookings: {
      type: Number,
      default: 0,
    },
    skippedBookings: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    errorMessages: [
      {
        message: String,
        bookingId: String,
        timestamp: Date,
      },
    ],
    duration: {
      type: Number, // in milliseconds
      default: 0,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
syncLogSchema.index({ userId: 1, createdAt: -1 });
syncLogSchema.index({ platform: 1, createdAt: -1 });

module.exports = mongoose.model("SyncLog", syncLogSchema);
