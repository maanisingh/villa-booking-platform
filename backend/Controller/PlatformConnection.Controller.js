const PlatformConnection = require("../Models/PlatformConnection.Model");

// Get all platform connections
const getAllPlatforms = async (req, res) => {
  try {
    const platforms = await PlatformConnection.find().sort({ platform: 1 });

    return res.status(200).json({
      success: true,
      message: "Platforms fetched successfully",
      data: platforms,
      count: platforms.length,
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching platforms",
      error: error.message,
    });
  }
};

// Get single platform by ID or platform name
const getPlatform = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's an ObjectId or platform name
    let platform;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      platform = await PlatformConnection.findById(id);
    } else {
      platform = await PlatformConnection.getByPlatform(id);
    }

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Platform fetched successfully",
      data: platform,
    });
  } catch (error) {
    console.error("Error fetching platform:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching platform",
      error: error.message,
    });
  }
};

// Connect new platform
const connectPlatform = async (req, res) => {
  try {
    const { platform, credentials } = req.body;

    if (!platform || !credentials) {
      return res.status(400).json({
        success: false,
        message: "Platform and credentials are required",
      });
    }

    // Check if platform already connected
    const existing = await PlatformConnection.getByPlatform(platform);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${platform} is already connected. Use update endpoint to modify credentials.`,
      });
    }

    // Create new platform connection
    const newPlatform = new PlatformConnection({
      platform,
      credentials,
      status: "testing",
    });

    await newPlatform.save();

    // Test connection (placeholder - would call actual platform API)
    const testResult = await newPlatform.testConnection();

    return res.status(201).json({
      success: true,
      message: `${platform} connected successfully`,
      data: newPlatform,
      testResult,
    });
  } catch (error) {
    console.error("Error connecting platform:", error);
    return res.status(500).json({
      success: false,
      message: "Error connecting platform",
      error: error.message,
    });
  }
};

// Update platform credentials
const updatePlatform = async (req, res) => {
  try {
    const { id } = req.params;
    const { credentials, status, autoSync } = req.body;

    const platform = await PlatformConnection.findById(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    // Update credentials if provided
    if (credentials) {
      platform.credentials = credentials;
    }

    // Update status if provided
    if (status) {
      platform.status = status;
    }

    // Update auto-sync settings if provided
    if (autoSync !== undefined) {
      platform.autoSync.enabled = autoSync.enabled || platform.autoSync.enabled;
      platform.autoSync.frequency = autoSync.frequency || platform.autoSync.frequency;
    }

    await platform.save();

    return res.status(200).json({
      success: true,
      message: "Platform updated successfully",
      data: platform,
    });
  } catch (error) {
    console.error("Error updating platform:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating platform",
      error: error.message,
    });
  }
};

// Disconnect platform
const disconnectPlatform = async (req, res) => {
  try {
    const { id } = req.params;

    const platform = await PlatformConnection.findById(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    // Update status to disconnected instead of deleting
    platform.status = "disconnected";
    await platform.save();

    return res.status(200).json({
      success: true,
      message: `${platform.displayName} disconnected successfully`,
      data: platform,
    });
  } catch (error) {
    console.error("Error disconnecting platform:", error);
    return res.status(500).json({
      success: false,
      message: "Error disconnecting platform",
      error: error.message,
    });
  }
};

// Test platform connection
const testPlatformConnection = async (req, res) => {
  try {
    const { id } = req.params;

    const platform = await PlatformConnection.findById(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    // Test connection
    const testResult = await platform.testConnection();

    return res.status(200).json({
      success: true,
      message: "Connection test completed",
      data: testResult,
      platform: platform,
    });
  } catch (error) {
    console.error("Error testing connection:", error);
    return res.status(500).json({
      success: false,
      message: "Error testing connection",
      error: error.message,
    });
  }
};

// Manual sync trigger
const syncPlatform = async (req, res) => {
  try {
    const { id } = req.params;

    const platform = await PlatformConnection.findById(id);

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "Platform not found",
      });
    }

    if (platform.status !== "connected") {
      return res.status(400).json({
        success: false,
        message: "Platform must be connected to sync",
      });
    }

    // Placeholder for actual sync logic
    // In production, this would call platform API and sync data

    const syncStartTime = Date.now();

    // Simulate sync (in production, replace with actual API calls)
    const mockSyncResults = {
      totalListings: Math.floor(Math.random() * 200) + 50,
      newListings: Math.floor(Math.random() * 10),
      updatedListings: Math.floor(Math.random() * 20),
      totalBookings: Math.floor(Math.random() * 500) + 100,
    };

    const syncEndTime = Date.now();
    const syncDuration = ((syncEndTime - syncStartTime) / 1000).toFixed(2) + "s";

    // Update platform sync stats
    await platform.updateSyncStats({
      totalListings: mockSyncResults.totalListings,
      totalBookings: mockSyncResults.totalBookings,
      lastSyncDuration: syncDuration,
    });

    return res.status(200).json({
      success: true,
      message: `${platform.displayName} synced successfully`,
      data: {
        syncResults: mockSyncResults,
        syncDuration,
        lastSync: platform.lastSync,
      },
    });
  } catch (error) {
    console.error("Error syncing platform:", error);
    return res.status(500).json({
      success: false,
      message: "Error syncing platform",
      error: error.message,
    });
  }
};

// Get platform stats
const getPlatformStats = async (req, res) => {
  try {
    const platforms = await PlatformConnection.find();

    const stats = {
      total: platforms.length,
      connected: platforms.filter((p) => p.status === "connected").length,
      disconnected: platforms.filter((p) => p.status === "disconnected").length,
      error: platforms.filter((p) => p.status === "error").length,
      totalListings: platforms.reduce((sum, p) => sum + p.syncStats.totalListings, 0),
      totalBookings: platforms.reduce((sum, p) => sum + p.syncStats.totalBookings, 0),
      mappedVillas: platforms.reduce((sum, p) => sum + p.syncStats.mappedVillas, 0),
      unmappedListings: platforms.reduce((sum, p) => sum + p.syncStats.unmappedListings, 0),
    };

    return res.status(200).json({
      success: true,
      message: "Platform stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching platform stats",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPlatforms,
  getPlatform,
  connectPlatform,
  updatePlatform,
  disconnectPlatform,
  testPlatformConnection,
  syncPlatform,
  getPlatformStats,
};
