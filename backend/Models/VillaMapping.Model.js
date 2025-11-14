const mongoose = require("mongoose");

const villaMappingSchema = new mongoose.Schema(
  {
    villaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },
    villaName: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Login",
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
    },
    // Array of platform mappings - ONE villa can be on MULTIPLE platforms
    platformMappings: [
      {
        platformConnectionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PlatformConnection",
          required: true,
        },
        platform: {
          type: String,
          required: true,
          enum: ["airbnb", "booking_com", "vrbo", "expedia"],
        },
        externalListingId: {
          type: String,
          required: true, // The listing ID on the external platform
        },
        externalListingName: {
          type: String, // Name of listing on platform (may differ from villa name)
        },
        syncDirection: {
          type: String,
          enum: ["pull", "push", "bidirectional"],
          default: "bidirectional",
        },
        autoSync: {
          type: Boolean,
          default: true,
        },
        lastSync: {
          type: Date,
          default: null,
        },
        syncStatus: {
          type: String,
          enum: ["active", "paused", "error", "pending"],
          default: "pending",
        },
        lastSyncError: {
          type: String,
          default: null,
        },
        bookingCount: {
          type: Number,
          default: 0,
        },
        // Field mappings configuration
        fieldMappings: {
          title: {
            direction: { type: String, enum: ["pull", "push", "bidirectional"], default: "bidirectional" },
            platformField: { type: String, default: "title" },
            villaField: { type: String, default: "villaName" },
          },
          description: {
            direction: { type: String, enum: ["pull", "push", "bidirectional"], default: "bidirectional" },
            platformField: { type: String, default: "description" },
            villaField: { type: String, default: "description" },
          },
          price: {
            direction: { type: String, enum: ["pull", "push", "bidirectional"], default: "bidirectional" },
            platformField: { type: String, default: "price" },
            villaField: { type: String, default: "pricePerNight" },
          },
          availability: {
            direction: { type: String, enum: ["pull", "push", "bidirectional"], default: "bidirectional" },
            platformField: { type: String, default: "calendar" },
            villaField: { type: String, default: "availability" },
          },
          bookings: {
            direction: { type: String, enum: ["pull", "push", "bidirectional"], default: "bidirectional" },
            enabled: { type: Boolean, default: true },
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        mappedBy: {
          type: String, // Admin who created the mapping
        },
      },
    ],
    // Consolidated stats across all platforms
    consolidatedStats: {
      totalPlatforms: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      activeBookings: { type: Number, default: 0 },
      upcomingBookings: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      lastBookingDate: { type: Date, default: null },
    },
    // Sync settings
    syncPreferences: {
      conflictResolution: {
        type: String,
        enum: ["platform_priority", "manual_review", "last_update_wins"],
        default: "manual_review",
      },
      syncFrequency: {
        type: Number,
        default: 15, // minutes
      },
      enableWebhooks: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups
villaMappingSchema.index({ villaId: 1, ownerId: 1 });
villaMappingSchema.index({ "platformMappings.platform": 1 });
villaMappingSchema.index({ "platformMappings.externalListingId": 1 });
villaMappingSchema.index({ ownerId: 1, isActive: 1 });

// Pre-save hook to update consolidated stats
villaMappingSchema.pre('save', function(next) {
  this.consolidatedStats.totalPlatforms = this.platformMappings.length;

  // Calculate total bookings across all platforms
  this.consolidatedStats.totalBookings = this.platformMappings.reduce(
    (sum, mapping) => sum + (mapping.bookingCount || 0),
    0
  );

  next();
});

// Method to add platform mapping
villaMappingSchema.methods.addPlatformMapping = function(mappingData) {
  // Check if platform already exists for this villa
  const existingIndex = this.platformMappings.findIndex(
    m => m.platform === mappingData.platform
  );

  if (existingIndex >= 0) {
    // Update existing mapping
    this.platformMappings[existingIndex] = {
      ...this.platformMappings[existingIndex],
      ...mappingData,
    };
  } else {
    // Add new mapping
    this.platformMappings.push(mappingData);
  }

  return this.save();
};

// Method to remove platform mapping
villaMappingSchema.methods.removePlatformMapping = function(platform) {
  this.platformMappings = this.platformMappings.filter(
    m => m.platform !== platform
  );
  return this.save();
};

// Method to get mapping for specific platform
villaMappingSchema.methods.getPlatformMapping = function(platform) {
  return this.platformMappings.find(m => m.platform === platform);
};

// Method to update sync status for platform
villaMappingSchema.methods.updatePlatformSyncStatus = function(platform, status, error = null) {
  const mapping = this.platformMappings.find(m => m.platform === platform);

  if (mapping) {
    mapping.syncStatus = status;
    mapping.lastSync = new Date();
    if (error) {
      mapping.lastSyncError = error;
    }
  }

  return this.save();
};

// Static method to find all mappings for a villa
villaMappingSchema.statics.getByVilla = function(villaId) {
  return this.findOne({ villaId, isActive: true });
};

// Static method to find all villas mapped to a specific platform
villaMappingSchema.statics.getByPlatform = function(platform) {
  return this.find({
    "platformMappings.platform": platform,
    isActive: true,
  });
};

// Static method to find villa by external listing ID
villaMappingSchema.statics.findByExternalId = function(platform, externalListingId) {
  return this.findOne({
    "platformMappings.platform": platform,
    "platformMappings.externalListingId": externalListingId,
    isActive: true,
  });
};

// Static method to get owner's mapped villas
villaMappingSchema.statics.getOwnerMappings = function(ownerId) {
  return this.find({ ownerId, isActive: true });
};

const VillaMapping = mongoose.model("VillaMapping", villaMappingSchema);

module.exports = VillaMapping;
