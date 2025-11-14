const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  villaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Villa",            // Reference to your Villa model
    required: false,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",            // Reference to owner (if needed)
    required: true,
  },
  guestName: {
    type: String,
    required: true,
    trim: true,
  },
  totalFare: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: false,
  },
  bookingSource: {
    type: String,
    enum: ["Manual", "Airbnb", "Booking.com", "VRBO", "Expedia", "Website"], // Source type
    default: "Manual",
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Confirmed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // === PLATFORM INTEGRATION FIELDS ===
  externalBookingId: {
    type: String, // ID from external platform
    default: null,
  },
  syncedFrom: {
    type: String, // Platform it was synced from
    default: null,
  },
  lastSyncTime: {
    type: Date,
    default: null,
  },
  autoSynced: {
    type: Boolean,
    default: false, // true if synced automatically, false if manual
  },
  // ====================================
});

module.exports = mongoose.model("Booking", bookingSchema);
