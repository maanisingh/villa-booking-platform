const mongoose = require("mongoose");
const crypto = require("crypto");

// Encryption key (should be in environment variables in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "villa-booking-platform-secret-key-32";
const IV_LENGTH = 16;

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Decrypt function
function decrypt(text) {
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return text; // Return as-is if decryption fails
  }
}

const platformIntegrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed, // Support both String and ObjectId
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["airbnb", "booking_com", "vrbo", "expedia", "homeaway", "tripadvisor", "other"],
    },
    platformName: {
      type: String, // For "other" platforms
    },
    credentials: {
      apiKey: String,
      apiSecret: String,
      accessToken: String,
      refreshToken: String,
      partnerId: String,
      username: String,
      customFields: mongoose.Schema.Types.Mixed, // For platform-specific fields
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error", "pending"],
      default: "pending",
    },
    lastSync: {
      type: Date,
      default: null,
    },
    syncFrequency: {
      type: Number, // in hours
      default: 2,
    },
    autoSync: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    totalBookingsSynced: {
      type: Number,
      default: 0,
    },
    lastSyncResult: {
      newBookings: { type: Number, default: 0 },
      updatedBookings: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to encrypt sensitive credentials
platformIntegrationSchema.pre("save", function (next) {
  if (this.isModified("credentials")) {
    if (this.credentials.apiKey) {
      this.credentials.apiKey = encrypt(this.credentials.apiKey);
    }
    if (this.credentials.apiSecret) {
      this.credentials.apiSecret = encrypt(this.credentials.apiSecret);
    }
    if (this.credentials.accessToken) {
      this.credentials.accessToken = encrypt(this.credentials.accessToken);
    }
    if (this.credentials.refreshToken) {
      this.credentials.refreshToken = encrypt(this.credentials.refreshToken);
    }
  }
  next();
});

// Method to get decrypted credentials
platformIntegrationSchema.methods.getDecryptedCredentials = function () {
  const decrypted = { ...this.credentials.toObject() };
  if (decrypted.apiKey) decrypted.apiKey = decrypt(decrypted.apiKey);
  if (decrypted.apiSecret) decrypted.apiSecret = decrypt(decrypted.apiSecret);
  if (decrypted.accessToken) decrypted.accessToken = decrypt(decrypted.accessToken);
  if (decrypted.refreshToken) decrypted.refreshToken = decrypt(decrypted.refreshToken);
  return decrypted;
};

// Index for faster queries
platformIntegrationSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.model("PlatformIntegration", platformIntegrationSchema);
