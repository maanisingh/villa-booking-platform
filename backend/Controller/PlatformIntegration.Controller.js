/**
 * Platform Integration Controller
 *
 * Handles API endpoints for platform integration management
 */

const PlatformIntegration = require("../Models/PlatformIntegration.Model");
const BookingSyncService = require("../services/BookingSyncService");
const SyncLog = require("../Models/SyncLog.Model");

class PlatformIntegrationController {
  /**
   * Get all platform integrations for the authenticated user
   */
  static async getUserIntegrations(req, res) {
    try {
      const integrations = await PlatformIntegration.find({
        userId: req.user.id,
      }).select("-credentials"); // Don't send credentials to frontend

      // Add health status to each integration
      const integrationsWithStatus = await Promise.all(
        integrations.map(async (integration) => {
          const integrationObj = integration.toObject();

          // Add connection status
          if (integration.lastHealthCheck) {
            integrationObj.connectionStatus = integration.healthStatus || 'unknown';
            integrationObj.connectionMessage = integration.healthMessage;
          }

          return integrationObj;
        })
      );

      res.json({
        success: true,
        data: integrationsWithStatus,
        count: integrationsWithStatus.length
      });
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch platform integrations",
        error: error.message
      });
    }
  }

  /**
   * Get a specific platform integration
   */
  static async getIntegration(req, res) {
    try {
      const integration = await PlatformIntegration.findOne({
        _id: req.params.id,
        userId: req.user.id
      }).select("-credentials");

      if (!integration) {
        return res.status(404).json({
          success: false,
          message: "Integration not found"
        });
      }

      res.json({
        success: true,
        data: integration
      });
    } catch (error) {
      console.error("Error fetching integration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch integration",
        error: error.message
      });
    }
  }

  /**
   * Connect to a new platform
   */
  static async connectPlatform(req, res) {
    try {
      const { platform, credentials, syncFrequency, autoSync } = req.body;

      // Validate required fields
      if (!platform || !credentials) {
        return res.status(400).json({
          success: false,
          message: "Platform and credentials are required"
        });
      }

      // Check if platform is supported
      const supportedPlatforms = ['airbnb', 'booking_com', 'vrbo', 'expedia'];
      if (!supportedPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          message: `Platform ${platform} is not supported. Supported platforms: ${supportedPlatforms.join(', ')}`
        });
      }

      // Check if already connected
      const existingIntegration = await PlatformIntegration.findOne({
        userId: req.user.id,
        platform,
      });

      if (existingIntegration) {
        return res.status(400).json({
          success: false,
          message: `You are already connected to ${platform}. Please disconnect first to reconnect.`
        });
      }

      // Validate credentials with the platform
      const validationResult = await BookingSyncService.validateCredentials(
        platform,
        credentials
      );

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: `Invalid credentials: ${validationResult.message}`
        });
      }

      // Create new integration
      const integration = await PlatformIntegration.create({
        userId: req.user.id,
        platform,
        credentials, // Will be encrypted by the model
        syncFrequency: syncFrequency || 2,
        autoSync: autoSync !== false,
        status: "active",
        totalBookingsSynced: 0
      });

      // Return without credentials
      const responseData = integration.toObject();
      delete responseData.credentials;

      res.status(201).json({
        success: true,
        message: `Successfully connected to ${platform}`,
        data: responseData
      });
    } catch (error) {
      console.error("Error connecting platform:", error);
      res.status(500).json({
        success: false,
        message: "Failed to connect platform",
        error: error.message
      });
    }
  }

  /**
   * Update platform integration settings
   */
  static async updateIntegration(req, res) {
    try {
      const { syncFrequency, autoSync, credentials } = req.body;

      const integration = await PlatformIntegration.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!integration) {
        return res.status(404).json({
          success: false,
          message: "Integration not found"
        });
      }

      // Update fields
      if (syncFrequency !== undefined) {
        integration.syncFrequency = syncFrequency;
      }

      if (autoSync !== undefined) {
        integration.autoSync = autoSync;
      }

      if (credentials) {
        // Validate new credentials
        const validationResult = await BookingSyncService.validateCredentials(
          integration.platform,
          credentials
        );

        if (!validationResult.success) {
          return res.status(400).json({
            success: false,
            message: `Invalid credentials: ${validationResult.message}`
          });
        }

        integration.credentials = credentials;
      }

      await integration.save();

      // Return without credentials
      const responseData = integration.toObject();
      delete responseData.credentials;

      res.json({
        success: true,
        message: "Integration updated successfully",
        data: responseData
      });
    } catch (error) {
      console.error("Error updating integration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update integration",
        error: error.message
      });
    }
  }

  /**
   * Disconnect from a platform
   */
  static async disconnectPlatform(req, res) {
    try {
      const result = await PlatformIntegration.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Integration not found"
        });
      }

      res.json({
        success: true,
        message: `Successfully disconnected from ${result.platform}`
      });
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      res.status(500).json({
        success: false,
        message: "Failed to disconnect platform",
        error: error.message
      });
    }
  }

  /**
   * Manual sync for a specific platform
   */
  static async syncPlatform(req, res) {
    try {
      const { platform } = req.params;

      // Check if integration exists
      const integration = await PlatformIntegration.findOne({
        userId: req.user.id,
        platform,
        status: "active"
      });

      if (!integration) {
        return res.status(404).json({
          success: false,
          message: `No active integration found for ${platform}`
        });
      }

      // Start sync process
      const syncResult = await BookingSyncService.syncPlatform(
        req.user.id,
        platform
      );

      res.json({
        success: true,
        message: `Sync completed for ${platform}`,
        data: syncResult
      });
    } catch (error) {
      console.error("Error syncing platform:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync platform",
        error: error.message
      });
    }
  }

  /**
   * Sync all platforms for the user
   */
  static async syncAllPlatforms(req, res) {
    try {
      const results = await BookingSyncService.syncAllPlatforms(req.user.id);

      const summary = {
        totalPlatforms: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        totalNewBookings: results.reduce((sum, r) => sum + (r.newBookings || 0), 0),
        totalUpdatedBookings: results.reduce((sum, r) => sum + (r.updatedBookings || 0), 0),
        details: results
      };

      res.json({
        success: true,
        message: "Sync completed for all platforms",
        data: summary
      });
    } catch (error) {
      console.error("Error syncing all platforms:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync platforms",
        error: error.message
      });
    }
  }

  /**
   * Get sync history
   */
  static async getSyncHistory(req, res) {
    try {
      const { platform, limit = 10, offset = 0 } = req.query;

      // Skip ObjectId validation for admin users
      if (req.user.id === 'admin_id' || req.user.role === 'admin') {
        // Return empty array for admin since admin doesn't have sync logs
        return res.json({
          success: true,
          data: {
            logs: [],
            total: 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        });
      }

      const query = { userId: req.user.id };
      if (platform) {
        query.platform = platform;
      }

      const syncLogs = await SyncLog.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      const total = await SyncLog.countDocuments(query);

      res.json({
        success: true,
        data: {
          logs: syncLogs,
          total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error("Error fetching sync history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sync history",
        error: error.message
      });
    }
  }

  /**
   * Get sync statistics
   */
  static async getSyncStatistics(req, res) {
    try {
      // Skip for admin users
      if (req.user.id === 'admin_id' || req.user.role === 'admin') {
        return res.json({
          success: true,
          data: {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            platformBreakdown: {}
          }
        });
      }

      const stats = await BookingSyncService.getSyncStatistics(req.user.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching sync statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch sync statistics",
        error: error.message
      });
    }
  }

  /**
   * Test platform connection
   */
  static async testConnection(req, res) {
    try {
      const { platform, credentials } = req.body;

      if (!platform || !credentials) {
        return res.status(400).json({
          success: false,
          message: "Platform and credentials are required"
        });
      }

      const result = await BookingSyncService.validateCredentials(
        platform,
        credentials
      );

      res.json({
        success: result.success,
        message: result.message || (result.success ? "Connection successful" : "Connection failed")
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({
        success: false,
        message: "Failed to test connection",
        error: error.message
      });
    }
  }
}

module.exports = PlatformIntegrationController;