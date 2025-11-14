const VillaMapping = require("../Models/VillaMapping.Model");
const PlatformConnection = require("../Models/PlatformConnection.Model");
const Villa = require("../Models/villaModel");

// Get all villa mappings (admin view)
const getAllMappings = async (req, res) => {
  try {
    const mappings = await VillaMapping.find({ isActive: true })
      .populate("villaId")
      .populate("ownerId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Villa mappings fetched successfully",
      data: mappings,
      count: mappings.length,
    });
  } catch (error) {
    console.error("Error fetching mappings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching mappings",
      error: error.message,
    });
  }
};

// Get mapping for specific villa
const getVillaMapping = async (req, res) => {
  try {
    const { villaId } = req.params;

    const mapping = await VillaMapping.getByVilla(villaId);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "No mapping found for this villa",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Villa mapping fetched successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Error fetching villa mapping:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching villa mapping",
      error: error.message,
    });
  }
};

// Create or update villa mapping
const createOrUpdateMapping = async (req, res) => {
  try {
    const { villaId, platform, externalListingId, syncDirection, autoSync, externalListingName } = req.body;

    if (!villaId || !platform || !externalListingId) {
      return res.status(400).json({
        success: false,
        message: "Villa ID, platform, and external listing ID are required",
      });
    }

    // Verify platform is connected
    const platformConnection = await PlatformConnection.getByPlatform(platform);
    if (!platformConnection || platformConnection.status !== "connected") {
      return res.status(400).json({
        success: false,
        message: `${platform} is not connected. Please connect the platform first.`,
      });
    }

    // Get villa details
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found",
      });
    }

    // Check if mapping exists for this villa
    let mapping = await VillaMapping.getByVilla(villaId);

    const platformMappingData = {
      platformConnectionId: platformConnection._id,
      platform,
      externalListingId,
      externalListingName: externalListingName || villa.villaName,
      syncDirection: syncDirection || "bidirectional",
      autoSync: autoSync !== undefined ? autoSync : true,
      mappedBy: req.user?.email || "admin",
    };

    if (mapping) {
      // Add or update platform mapping
      await mapping.addPlatformMapping(platformMappingData);

      return res.status(200).json({
        success: true,
        message: `Villa mapped to ${platform} successfully`,
        data: mapping,
      });
    } else {
      // Create new mapping
      mapping = new VillaMapping({
        villaId,
        villaName: villa.villaName,
        ownerId: villa.ownerId,
        ownerEmail: villa.ownerEmail || "unknown",
        platformMappings: [platformMappingData],
      });

      await mapping.save();

      // Update platform stats
      await platformConnection.updateSyncStats({
        mappedVillas: (platformConnection.syncStats.mappedVillas || 0) + 1,
      });

      return res.status(201).json({
        success: true,
        message: `Villa mapped to ${platform} successfully`,
        data: mapping,
      });
    }
  } catch (error) {
    console.error("Error creating/updating mapping:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating/updating mapping",
      error: error.message,
    });
  }
};

// Remove platform mapping from villa
const removePlatformMapping = async (req, res) => {
  try {
    const { villaId, platform } = req.params;

    const mapping = await VillaMapping.getByVilla(villaId);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "No mapping found for this villa",
      });
    }

    await mapping.removePlatformMapping(platform);

    return res.status(200).json({
      success: true,
      message: `${platform} mapping removed successfully`,
      data: mapping,
    });
  } catch (error) {
    console.error("Error removing platform mapping:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing platform mapping",
      error: error.message,
    });
  }
};

// Get all villas mapped to a specific platform
const getMappingsByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;

    const mappings = await VillaMapping.getByPlatform(platform);

    return res.status(200).json({
      success: true,
      message: `Villas mapped to ${platform} fetched successfully`,
      data: mappings,
      count: mappings.length,
    });
  } catch (error) {
    console.error("Error fetching mappings by platform:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching mappings",
      error: error.message,
    });
  }
};

// Get owner's mapped villas
const getOwnerMappings = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const mappings = await VillaMapping.getOwnerMappings(ownerId);

    return res.status(200).json({
      success: true,
      message: "Owner's mapped villas fetched successfully",
      data: mappings,
      count: mappings.length,
    });
  } catch (error) {
    console.error("Error fetching owner mappings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching owner mappings",
      error: error.message,
    });
  }
};

// Update sync status for platform
const updateSyncStatus = async (req, res) => {
  try {
    const { villaId, platform } = req.params;
    const { status, error } = req.body;

    const mapping = await VillaMapping.getByVilla(villaId);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "No mapping found for this villa",
      });
    }

    await mapping.updatePlatformSyncStatus(platform, status, error);

    return res.status(200).json({
      success: true,
      message: "Sync status updated successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Error updating sync status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating sync status",
      error: error.message,
    });
  }
};

// Get consolidated stats across all platforms
const getConsolidatedStats = async (req, res) => {
  try {
    const mappings = await VillaMapping.find({ isActive: true });

    const stats = {
      totalVillasMapped: mappings.length,
      totalPlatformConnections: mappings.reduce((sum, m) => sum + m.consolidatedStats.totalPlatforms, 0),
      totalBookingsAcrossPlatforms: mappings.reduce((sum, m) => sum + m.consolidatedStats.totalBookings, 0),
      platformBreakdown: {},
    };

    // Count villas per platform
    const platforms = ["airbnb", "booking_com", "vrbo", "expedia"];
    platforms.forEach(platform => {
      stats.platformBreakdown[platform] = mappings.filter(m =>
        m.platformMappings.some(pm => pm.platform === platform)
      ).length;
    });

    return res.status(200).json({
      success: true,
      message: "Consolidated stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching consolidated stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching consolidated stats",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMappings,
  getVillaMapping,
  createOrUpdateMapping,
  removePlatformMapping,
  getMappingsByPlatform,
  getOwnerMappings,
  updateSyncStatus,
  getConsolidatedStats,
};
