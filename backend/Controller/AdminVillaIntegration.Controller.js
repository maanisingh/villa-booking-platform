/**
 * Admin Villa Integration Controller
 *
 * Handles API endpoints for admin management of villa-specific platform integrations
 */

const VillaIntegration = require("../Models/VillaIntegration.Model");
const Villa = require("../Models/villaModel");
const PlatformCredentials = require("../Models/PlatformCredentials.Model");
const BookingSyncService = require("../services/BookingSyncService");

class AdminVillaIntegrationController {
  /**
   * Get all villa integrations (Admin only)
   */
  static async getAllVillaIntegrations(req, res) {
    try {
      const integrations = await VillaIntegration.find()
        .populate('villaId', 'name villaName')
        .populate('ownerId', 'name ownerName email')
        .select("-credentials.apiSecret -credentials.password -credentials.refreshToken")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: integrations,
        count: integrations.length
      });
    } catch (error) {
      console.error("Error fetching villa integrations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch villa integrations",
        error: error.message
      });
    }
  }

  /**
   * Get integrations for a specific villa
   */
  static async getVillaIntegrations(req, res) {
    try {
      const { villaId } = req.params;

      const integrations = await VillaIntegration.find({ villaId })
        .select("-credentials.apiSecret -credentials.password -credentials.refreshToken")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: integrations,
        count: integrations.length
      });
    } catch (error) {
      console.error("Error fetching villa integrations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch villa integrations",
        error: error.message
      });
    }
  }

  /**
   * Get integrations for a specific owner
   */
  static async getOwnerIntegrations(req, res) {
    try {
      const { ownerId } = req.params;

      const integrations = await VillaIntegration.find({ ownerId })
        .populate('villaId', 'name villaName')
        .select("-credentials.apiSecret -credentials.password -credentials.refreshToken")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: integrations,
        count: integrations.length
      });
    } catch (error) {
      console.error("Error fetching owner integrations:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch owner integrations",
        error: error.message
      });
    }
  }

  /**
   * Add a new villa integration
   */
  static async addVillaIntegration(req, res) {
    try {
      const { villaId, ownerId, platform, credentials, credentialId } = req.body;

      // Validate required fields
      if (!villaId || !platform) {
        return res.status(400).json({
          success: false,
          message: "Villa ID and platform are required"
        });
      }

      // Check if villa exists
      const villa = await Villa.findById(villaId);
      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found"
        });
      }

      // Check for duplicate integration
      const existing = await VillaIntegration.findOne({
        villaId,
        platform
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `This villa is already connected to ${platform}. Please update or remove the existing integration first.`
        });
      }

      // Determine which credentials to use
      let finalCredentials;

      if (credentialId) {
        // Use saved credentials from PlatformCredentials
        const savedCredential = await PlatformCredentials.findById(credentialId);

        if (!savedCredential) {
          return res.status(404).json({
            success: false,
            message: "Saved credentials not found"
          });
        }

        if (savedCredential.platform !== platform) {
          return res.status(400).json({
            success: false,
            message: "Platform mismatch between selected credentials and integration"
          });
        }

        if (!savedCredential.isActive) {
          return res.status(400).json({
            success: false,
            message: "Selected credentials are not active"
          });
        }

        // Get decrypted credentials from saved credential
        finalCredentials = savedCredential.getDecryptedCredentials();
      } else if (credentials) {
        // Use manually entered credentials
        finalCredentials = credentials;
      } else {
        return res.status(400).json({
          success: false,
          message: "Either credentials or credentialId is required"
        });
      }

      // Validate credentials
      const validationResult = await BookingSyncService.validateCredentials(
        platform,
        finalCredentials
      );

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: `Invalid credentials: ${validationResult.message}`
        });
      }

      // Create integration
      const integration = await VillaIntegration.create({
        villaId,
        ownerId: ownerId || villa.ownerId || villa.owner,
        platform,
        credentials: finalCredentials,
        status: "active",
        autoSync: true,
        syncFrequency: 2
      });

      // Populate villa and owner details
      await integration.populate('villaId', 'name villaName');
      await integration.populate('ownerId', 'name ownerName email');

      // Remove sensitive data
      const responseData = integration.toObject();
      if (responseData.credentials) {
        delete responseData.credentials.apiSecret;
        delete responseData.credentials.password;
        delete responseData.credentials.refreshToken;
      }

      res.status(201).json({
        success: true,
        message: "Villa integration added successfully",
        data: responseData
      });
    } catch (error) {
      console.error("Error adding villa integration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add villa integration",
        error: error.message
      });
    }
  }

  /**
   * Update villa integration
   */
  static async updateVillaIntegration(req, res) {
    try {
      const { id } = req.params;
      const { credentials, autoSync, syncFrequency, status } = req.body;

      const integration = await VillaIntegration.findById(id);

      if (!integration) {
        return res.status(404).json({
          success: false,
          message: "Integration not found"
        });
      }

      // Update credentials if provided
      if (credentials) {
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

      // Update other fields
      if (autoSync !== undefined) integration.autoSync = autoSync;
      if (syncFrequency !== undefined) integration.syncFrequency = syncFrequency;
      if (status !== undefined) integration.status = status;

      await integration.save();

      // Populate details
      await integration.populate('villaId', 'name villaName');
      await integration.populate('ownerId', 'name ownerName email');

      // Remove sensitive data
      const responseData = integration.toObject();
      if (responseData.credentials) {
        delete responseData.credentials.apiSecret;
        delete responseData.credentials.password;
        delete responseData.credentials.refreshToken;
      }

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
   * Delete villa integration
   */
  static async deleteVillaIntegration(req, res) {
    try {
      const { id } = req.params;

      const integration = await VillaIntegration.findByIdAndDelete(id);

      if (!integration) {
        return res.status(404).json({
          success: false,
          message: "Integration not found"
        });
      }

      res.json({
        success: true,
        message: `Successfully removed ${integration.platform} integration`
      });
    } catch (error) {
      console.error("Error deleting integration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete integration",
        error: error.message
      });
    }
  }

  /**
   * Manually sync a specific villa integration
   */
  static async syncVillaIntegration(req, res) {
    try {
      const { id } = req.params;

      const integration = await VillaIntegration.findById(id);

      if (!integration) {
        return res.status(404).json({
          success: false,
          message: "Integration not found"
        });
      }

      if (integration.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Integration is not active. Please activate it first."
        });
      }

      // Perform sync
      const syncResult = await BookingSyncService.syncVillaIntegration(integration);

      // Update integration
      integration.lastSync = new Date();
      integration.lastSyncResult = syncResult;
      integration.totalBookingsSynced = (integration.totalBookingsSynced || 0) +
        (syncResult.newBookings || 0) + (syncResult.updatedBookings || 0);

      if (syncResult.success) {
        integration.status = "active";
        integration.errorMessage = null;
      } else {
        integration.status = "error";
        integration.errorMessage = syncResult.message || "Sync failed";
      }

      await integration.save();

      res.json({
        success: true,
        message: "Sync completed",
        data: syncResult
      });
    } catch (error) {
      console.error("Error syncing integration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync integration",
        error: error.message
      });
    }
  }

  /**
   * Get integration statistics
   */
  static async getIntegrationStats(req, res) {
    try {
      const totalIntegrations = await VillaIntegration.countDocuments();
      const activeIntegrations = await VillaIntegration.countDocuments({ status: "active" });
      const errorIntegrations = await VillaIntegration.countDocuments({ status: "error" });

      const platformStats = await VillaIntegration.aggregate([
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 },
            totalBookings: { $sum: "$totalBookingsSynced" }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          totalIntegrations,
          activeIntegrations,
          errorIntegrations,
          platformBreakdown: platformStats
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error: error.message
      });
    }
  }
}

module.exports = AdminVillaIntegrationController;
