/**
 * Villa Publishing Controller
 *
 * Handles publishing villas to multiple platforms
 */

const Villa = require("../Models/villaModel");
const PlatformIntegration = require("../Models/PlatformIntegration.Model");
const AirbnbService = require("../services/integrations/AirbnbService");
const BookingComService = require("../services/integrations/BookingComService");
const VRBOService = require("../services/integrations/VRBOService");

class VillaPublishingController {
  /**
   * Get service instance for a platform
   */
  static getServiceInstance(platform, credentials) {
    const services = {
      airbnb: AirbnbService,
      booking_com: BookingComService,
      vrbo: VRBOService,
    };

    const ServiceClass = services[platform];
    if (!ServiceClass) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    return new ServiceClass(credentials);
  }

  /**
   * Publish villa to a specific platform
   */
  static async publishToPlatform(req, res) {
    try {
      const { villaId } = req.params;
      const { platform } = req.body;

      // Validate villa ownership
      const villa = await Villa.findOne({
        _id: villaId,
        owner: req.user.id
      });

      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found or you don't have permission"
        });
      }

      // Check if platform integration exists
      const integration = await PlatformIntegration.findOne({
        userId: req.user.id,
        platform,
        status: "active"
      });

      if (!integration) {
        return res.status(400).json({
          success: false,
          message: `You need to connect to ${platform} first`
        });
      }

      // Check if already published to this platform
      if (villa.platformListings && villa.platformListings[platform]) {
        return res.status(400).json({
          success: false,
          message: `Villa is already published to ${platform}`
        });
      }

      // Get service and publish
      const service = this.getServiceInstance(
        platform,
        integration.getDecryptedCredentials()
      );

      const publishResult = await service.publishListing(villa);

      if (!publishResult.success) {
        return res.status(400).json({
          success: false,
          message: `Failed to publish to ${platform}: ${publishResult.error}`
        });
      }

      // Update villa with platform listing info
      if (!villa.platformListings) {
        villa.platformListings = {};
      }

      villa.platformListings[platform] = {
        listingId: publishResult.listingId,
        url: publishResult.url,
        publishedAt: new Date(),
        status: 'active'
      };

      villa.publishedToPlatforms = Object.keys(villa.platformListings);
      await villa.save();

      res.json({
        success: true,
        message: `Successfully published villa to ${platform}`,
        data: {
          listingId: publishResult.listingId,
          url: publishResult.url,
          platform
        }
      });
    } catch (error) {
      console.error("Error publishing villa:", error);
      res.status(500).json({
        success: false,
        message: "Failed to publish villa",
        error: error.message
      });
    }
  }

  /**
   * Publish villa to multiple platforms
   */
  static async publishToMultiplePlatforms(req, res) {
    try {
      const { villaId } = req.params;
      const { platforms } = req.body;

      if (!Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of platforms"
        });
      }

      // Validate villa ownership
      const villa = await Villa.findOne({
        _id: villaId,
        owner: req.user.id
      });

      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found or you don't have permission"
        });
      }

      const results = {
        successful: [],
        failed: []
      };

      // Process each platform
      for (const platform of platforms) {
        try {
          // Check if already published
          if (villa.platformListings && villa.platformListings[platform]) {
            results.failed.push({
              platform,
              error: "Already published to this platform"
            });
            continue;
          }

          // Check integration
          const integration = await PlatformIntegration.findOne({
            userId: req.user.id,
            platform,
            status: "active"
          });

          if (!integration) {
            results.failed.push({
              platform,
              error: "Platform not connected"
            });
            continue;
          }

          // Publish to platform
          const service = this.getServiceInstance(
            platform,
            integration.getDecryptedCredentials()
          );

          const publishResult = await service.publishListing(villa);

          if (publishResult.success) {
            // Update villa
            if (!villa.platformListings) {
              villa.platformListings = {};
            }

            villa.platformListings[platform] = {
              listingId: publishResult.listingId,
              url: publishResult.url,
              publishedAt: new Date(),
              status: 'active'
            };

            results.successful.push({
              platform,
              listingId: publishResult.listingId,
              url: publishResult.url
            });
          } else {
            results.failed.push({
              platform,
              error: publishResult.error
            });
          }
        } catch (error) {
          results.failed.push({
            platform,
            error: error.message
          });
        }
      }

      // Save villa if any successful
      if (results.successful.length > 0) {
        villa.publishedToPlatforms = Object.keys(villa.platformListings);
        await villa.save();
      }

      res.json({
        success: results.successful.length > 0,
        message: `Published to ${results.successful.length} platform(s), failed for ${results.failed.length}`,
        data: results
      });
    } catch (error) {
      console.error("Error publishing to multiple platforms:", error);
      res.status(500).json({
        success: false,
        message: "Failed to publish villa",
        error: error.message
      });
    }
  }

  /**
   * Update villa listing on a platform
   */
  static async updatePlatformListing(req, res) {
    try {
      const { villaId, platform } = req.params;

      // Validate villa ownership
      const villa = await Villa.findOne({
        _id: villaId,
        owner: req.user.id
      });

      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found or you don't have permission"
        });
      }

      // Check if published to this platform
      if (!villa.platformListings || !villa.platformListings[platform]) {
        return res.status(400).json({
          success: false,
          message: `Villa is not published to ${platform}`
        });
      }

      // Get integration
      const integration = await PlatformIntegration.findOne({
        userId: req.user.id,
        platform,
        status: "active"
      });

      if (!integration) {
        return res.status(400).json({
          success: false,
          message: `Platform ${platform} is not connected`
        });
      }

      // Update on platform
      const service = this.getServiceInstance(
        platform,
        integration.getDecryptedCredentials()
      );

      const listingId = villa.platformListings[platform].listingId;
      const updateResult = await service.updateListing(listingId, villa);

      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          message: `Failed to update listing: ${updateResult.error}`
        });
      }

      // Update timestamp
      villa.platformListings[platform].lastUpdated = new Date();
      await villa.save();

      res.json({
        success: true,
        message: `Successfully updated listing on ${platform}`,
        data: villa.platformListings[platform]
      });
    } catch (error) {
      console.error("Error updating platform listing:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update listing",
        error: error.message
      });
    }
  }

  /**
   * Remove villa from a platform
   */
  static async unpublishFromPlatform(req, res) {
    try {
      const { villaId, platform } = req.params;

      // Validate villa ownership
      const villa = await Villa.findOne({
        _id: villaId,
        owner: req.user.id
      });

      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found or you don't have permission"
        });
      }

      // Check if published to this platform
      if (!villa.platformListings || !villa.platformListings[platform]) {
        return res.status(400).json({
          success: false,
          message: `Villa is not published to ${platform}`
        });
      }

      // Get integration
      const integration = await PlatformIntegration.findOne({
        userId: req.user.id,
        platform,
        status: "active"
      });

      if (integration) {
        try {
          // Delete from platform
          const service = this.getServiceInstance(
            platform,
            integration.getDecryptedCredentials()
          );

          const listingId = villa.platformListings[platform].listingId;
          await service.deleteListing(listingId);
        } catch (error) {
          console.error(`Failed to delete listing from ${platform}:`, error);
          // Continue even if deletion fails
        }
      }

      // Remove from villa
      delete villa.platformListings[platform];
      villa.publishedToPlatforms = Object.keys(villa.platformListings);
      await villa.save();

      res.json({
        success: true,
        message: `Successfully removed villa from ${platform}`
      });
    } catch (error) {
      console.error("Error unpublishing villa:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unpublish villa",
        error: error.message
      });
    }
  }

  /**
   * Get publishing status for a villa
   */
  static async getPublishingStatus(req, res) {
    try {
      const { villaId } = req.params;

      // Validate villa ownership
      const villa = await Villa.findOne({
        _id: villaId,
        owner: req.user.id
      });

      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found or you don't have permission"
        });
      }

      // Get all active integrations
      const integrations = await PlatformIntegration.find({
        userId: req.user.id,
        status: "active"
      }).select("platform");

      const availablePlatforms = integrations.map(i => i.platform);
      const publishedPlatforms = villa.platformListings || {};

      const status = {
        villa: {
          id: villa._id,
          name: villa.name
        },
        availablePlatforms,
        publishedPlatforms: Object.keys(publishedPlatforms).map(platform => ({
          platform,
          ...publishedPlatforms[platform]
        })),
        unpublishedPlatforms: availablePlatforms.filter(
          p => !publishedPlatforms[p]
        )
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error("Error getting publishing status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get publishing status",
        error: error.message
      });
    }
  }

  /**
   * Sync availability across platforms
   */
  static async syncAvailability(req, res) {
    try {
      const { villaId } = req.params;
      const { dates, available } = req.body;

      // Validate villa ownership
      const villa = await Villa.findOne({
        _id: villaId,
        owner: req.user.id
      });

      if (!villa) {
        return res.status(404).json({
          success: false,
          message: "Villa not found or you don't have permission"
        });
      }

      if (!villa.platformListings || Object.keys(villa.platformListings).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Villa is not published to any platforms"
        });
      }

      const results = {
        successful: [],
        failed: []
      };

      // Update availability on each platform
      for (const platform of Object.keys(villa.platformListings)) {
        try {
          const integration = await PlatformIntegration.findOne({
            userId: req.user.id,
            platform,
            status: "active"
          });

          if (!integration) {
            results.failed.push({
              platform,
              error: "Platform not connected"
            });
            continue;
          }

          const service = this.getServiceInstance(
            platform,
            integration.getDecryptedCredentials()
          );

          const listingId = villa.platformListings[platform].listingId;

          // Update availability if the service supports it
          if (service.updateAvailability) {
            const result = await service.updateAvailability(
              listingId,
              dates,
              available
            );

            if (result.success) {
              results.successful.push(platform);
            } else {
              results.failed.push({
                platform,
                error: result.error
              });
            }
          } else {
            results.failed.push({
              platform,
              error: "Platform doesn't support availability sync"
            });
          }
        } catch (error) {
          results.failed.push({
            platform,
            error: error.message
          });
        }
      }

      res.json({
        success: results.successful.length > 0,
        message: `Updated availability on ${results.successful.length} platform(s)`,
        data: results
      });
    } catch (error) {
      console.error("Error syncing availability:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync availability",
        error: error.message
      });
    }
  }
}

module.exports = VillaPublishingController;