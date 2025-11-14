const mongoose = require("mongoose");
const crypto = require("crypto");

// Encryption key (should be in environment variables in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "villa-booking-platform-secret-key-32";
const IV_LENGTH = 16;

// Encrypt function
function encrypt(text) {
  if (!text) return text;
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
  if (!text || !text.includes(':')) return text;
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

const platformCredentialsSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["airbnb", "booking_com", "vrbo", "expedia", "homeaway", "tripadvisor", "other"],
    },
    credentialName: {
      type: String,
      required: true,
      trim: true,
    },
    credentials: {
      // Airbnb fields
      clientId: String,
      clientSecret: String,
      listingId: String,

      // Booking.com fields
      hotelId: String,
      partnerId: String,

      // VRBO/Expedia fields
      propertyId: String,

      // Common fields
      apiKey: String,
      apiSecret: String,
      accessToken: String,
      refreshToken: String,
      username: String,
      password: String,

      // Custom fields for any platform
      customFields: mongoose.Schema.Types.Mixed,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Login',
      required: true,
    },
    description: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to encrypt sensitive credentials
platformCredentialsSchema.pre("save", function (next) {
  if (this.isModified("credentials")) {
    if (this.credentials) {
      // Encrypt sensitive fields
      if (this.credentials.apiKey && !this.credentials.apiKey.includes(':')) {
        this.credentials.apiKey = encrypt(this.credentials.apiKey);
      }
      if (this.credentials.apiSecret && !this.credentials.apiSecret.includes(':')) {
        this.credentials.apiSecret = encrypt(this.credentials.apiSecret);
      }
      if (this.credentials.accessToken && !this.credentials.accessToken.includes(':')) {
        this.credentials.accessToken = encrypt(this.credentials.accessToken);
      }
      if (this.credentials.refreshToken && !this.credentials.refreshToken.includes(':')) {
        this.credentials.refreshToken = encrypt(this.credentials.refreshToken);
      }
      if (this.credentials.clientSecret && !this.credentials.clientSecret.includes(':')) {
        this.credentials.clientSecret = encrypt(this.credentials.clientSecret);
      }
      if (this.credentials.password && !this.credentials.password.includes(':')) {
        this.credentials.password = encrypt(this.credentials.password);
      }
    }
  }
  next();
});

// Method to get decrypted credentials
platformCredentialsSchema.methods.getDecryptedCredentials = function () {
  if (!this.credentials) return {};

  const decrypted = { ...this.credentials.toObject() };
  if (decrypted.apiKey) decrypted.apiKey = decrypt(decrypted.apiKey);
  if (decrypted.apiSecret) decrypted.apiSecret = decrypt(decrypted.apiSecret);
  if (decrypted.accessToken) decrypted.accessToken = decrypt(decrypted.accessToken);
  if (decrypted.refreshToken) decrypted.refreshToken = decrypt(decrypted.refreshToken);
  if (decrypted.clientSecret) decrypted.clientSecret = decrypt(decrypted.clientSecret);
  if (decrypted.password) decrypted.password = decrypt(decrypted.password);
  return decrypted;
};

// Ensure unique credential name per platform
platformCredentialsSchema.index({ platform: 1, credentialName: 1 }, { unique: true });
platformCredentialsSchema.index({ createdBy: 1 });
platformCredentialsSchema.index({ isActive: 1 });

module.exports = mongoose.model("PlatformCredentials", platformCredentialsSchema);
