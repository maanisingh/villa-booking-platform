const mongoose = require("mongoose");
const crypto = require("crypto");

// Encryption key from environment or generate a secure one
const ENCRYPTION_KEY = process.env.PLATFORM_ENCRYPTION_KEY || crypto.randomBytes(32);
const ALGORITHM = "aes-256-cbc";

// Encrypt credentials function
function encryptCredentials(data) {
  if (!data || Object.keys(data).length === 0) return { encryptedData: "", iv: "" };

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
}

// Decrypt credentials function
function decryptCredentials(data) {
  if (!data || !data.encryptedData || !data.iv) return {};

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(data.iv, "hex")
    );

    let decrypted = decipher.update(data.encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return {};
  }
}

const platformConnectionSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      unique: true,
      enum: ["airbnb", "booking_com", "vrbo", "expedia"],
    },
    displayName: {
      type: String,
      required: true,
    },
    credentials: {
      type: Object,
      required: true,
      get: function (data) {
        // Decrypt when reading
        return decryptCredentials(data);
      },
      set: function (data) {
        // Encrypt when saving
        return encryptCredentials(data);
      },
    },
    status: {
      type: String,
      enum: ["connected", "disconnected", "error", "testing"],
      default: "testing",
    },
    lastSync: {
      type: Date,
      default: null,
    },
    syncStats: {
      totalListings: { type: Number, default: 0 },
      mappedVillas: { type: Number, default: 0 },
      unmappedListings: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      lastSyncDuration: { type: String, default: "0s" },
      lastError: { type: String, default: null },
    },
    webhookUrl: {
      type: String,
      default: function() {
        return `${process.env.BACKEND_URL || 'https://villas.alexandratechlab.com'}/api/webhooks/${this.platform}`;
      }
    },
    webhookSecret: {
      type: String,
      default: function() {
        return crypto.randomBytes(32).toString('hex');
      }
    },
    rateLimits: {
      requestsPerMinute: { type: Number, default: 60 },
      requestsPerDay: { type: Number, default: 5000 },
      currentUsage: { type: Number, default: 0 },
      resetAt: { type: Date, default: Date.now },
    },
    autoSync: {
      enabled: { type: Boolean, default: true },
      frequency: { type: Number, default: 15 }, // minutes
      lastAutoSync: { type: Date, default: null },
    },
    connectionTest: {
      tested: { type: Boolean, default: false },
      testedAt: { type: Date, default: null },
      success: { type: Boolean, default: false },
      errorMessage: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Index for fast platform lookup
platformConnectionSchema.index({ platform: 1 });
platformConnectionSchema.index({ status: 1 });

// Pre-save hook to set display names
platformConnectionSchema.pre('save', function(next) {
  const displayNames = {
    airbnb: 'Airbnb',
    booking_com: 'Booking.com',
    vrbo: 'VRBO',
    expedia: 'Expedia'
  };

  if (!this.displayName && this.platform) {
    this.displayName = displayNames[this.platform] || this.platform;
  }

  next();
});

// Method to test connection (placeholder for actual API calls)
platformConnectionSchema.methods.testConnection = async function() {
  try {
    // This would call the actual platform API to test credentials
    // For now, we'll simulate a successful test
    this.connectionTest.tested = true;
    this.connectionTest.testedAt = new Date();
    this.connectionTest.success = true;
    this.connectionTest.errorMessage = null;
    this.status = "connected";

    await this.save();
    return { success: true, message: "Connection test successful" };
  } catch (error) {
    this.connectionTest.tested = true;
    this.connectionTest.testedAt = new Date();
    this.connectionTest.success = false;
    this.connectionTest.errorMessage = error.message;
    this.status = "error";

    await this.save();
    return { success: false, message: error.message };
  }
};

// Method to update sync stats
platformConnectionSchema.methods.updateSyncStats = function(stats) {
  this.syncStats = {
    ...this.syncStats,
    ...stats,
  };
  this.lastSync = new Date();
  return this.save();
};

// Static method to get connection by platform
platformConnectionSchema.statics.getByPlatform = function(platform) {
  return this.findOne({ platform });
};

// Static method to get all connected platforms
platformConnectionSchema.statics.getAllConnected = function() {
  return this.find({ status: "connected" });
};

const PlatformConnection = mongoose.model("PlatformConnection", platformConnectionSchema);

module.exports = PlatformConnection;
