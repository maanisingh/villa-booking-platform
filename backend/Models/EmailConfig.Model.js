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
    return text;
  }
}

const emailConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed, // Support both String and ObjectId
      required: true,
      unique: true,
    },
    smtpHost: {
      type: String,
      required: true,
    },
    smtpPort: {
      type: Number,
      required: true,
      default: 587,
    },
    smtpSecure: {
      type: Boolean,
      default: false, // true for 465, false for other ports
    },
    smtpUser: {
      type: String,
      required: true,
    },
    smtpPassword: {
      type: String,
      required: true,
    },
    fromEmail: {
      type: String,
      required: true,
    },
    fromName: {
      type: String,
      default: "Villa Booking Platform",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      enum: ["gmail", "outlook", "sendgrid", "smtp2go", "custom"],
      default: "custom",
    },
    lastTested: {
      type: Date,
      default: null,
    },
    testStatus: {
      type: String,
      enum: ["success", "failed", "not_tested"],
      default: "not_tested",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to encrypt password
emailConfigSchema.pre("save", function (next) {
  if (this.isModified("smtpPassword")) {
    this.smtpPassword = encrypt(this.smtpPassword);
  }
  next();
});

// Method to get decrypted password
emailConfigSchema.methods.getDecryptedPassword = function () {
  return decrypt(this.smtpPassword);
};

// Index
emailConfigSchema.index({ userId: 1 });

module.exports = mongoose.model("EmailConfig", emailConfigSchema);
