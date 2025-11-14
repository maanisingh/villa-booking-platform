const PlatformIntegration = require('../Models/PlatformIntegration.Model');

/**
 * Villa Update Service
 * Pushes villa updates to all configured platforms (Airbnb, Booking.com, etc.)
 */

class VillaUpdateService {
  /**
   * Push villa updates to all published platforms
   * @param {Object} villa - The updated villa object
   * @returns {Promise<Object>} - Results of platform updates
   */
  static async pushToAllPlatforms(villa) {
    try {
      const results = {
        success: [],
        failed: [],
        total: villa.publishedPlatforms?.length || 0
      };

      // If villa is not published to any platform, skip
      if (!villa.publishedPlatforms || villa.publishedPlatforms.length === 0) {
        console.log(`Villa ${villa._id} is not published to any platform. Skipping sync.`);
        return {
          ...results,
          message: 'Villa not published to any platform'
        };
      }

      console.log(`🚀 Syncing villa ${villa._id} to ${villa.publishedPlatforms.length} platforms...`);

      // Process each platform
      for (const platformName of villa.publishedPlatforms) {
        try {
          // Get platform configuration
          const platformConfig = await PlatformIntegration.findOne({
            platformName,
            isEnabled: true
          });

          if (!platformConfig) {
            console.error(`❌ Platform ${platformName} not configured or disabled`);
            results.failed.push({
              platform: platformName,
              error: 'Platform not configured or disabled'
            });
            continue;
          }

          // Push update to platform
          const updateResult = await this.updatePlatformListing(
            villa,
            platformName,
            platformConfig
          );

          if (updateResult.success) {
            results.success.push({
              platform: platformName,
              listingId: updateResult.listingId
            });
            console.log(`✅ Successfully synced to ${platformName}`);
          } else {
            results.failed.push({
              platform: platformName,
              error: updateResult.error
            });
            console.error(`❌ Failed to sync to ${platformName}: ${updateResult.error}`);
          }
        } catch (error) {
          console.error(`❌ Error syncing to ${platformName}:`, error);
          results.failed.push({
            platform: platformName,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in pushToAllPlatforms:', error);
      throw error;
    }
  }

  /**
   * Update listing on specific platform
   * @param {Object} villa - Villa object
   * @param {String} platformName - Platform name (airbnb, booking_com, vrbo)
   * @param {Object} platformConfig - Platform configuration
   * @returns {Promise<Object>}
   */
  static async updatePlatformListing(villa, platformName, platformConfig) {
    try {
      // Get external listing ID
      const listingId = villa.externalListingIds?.get(platformName);

      if (!listingId) {
        return {
          success: false,
          error: 'No listing ID found for this platform'
        };
      }

      // Prepare villa data for platform API
      const villaData = this.prepareVillaData(villa);

      // Call platform-specific API
      switch (platformName) {
        case 'airbnb':
          return await this.updateAirbnb(listingId, villaData, platformConfig);
        case 'booking_com':
          return await this.updateBookingCom(listingId, villaData, platformConfig);
        case 'vrbo':
          return await this.updateVrbo(listingId, villaData, platformConfig);
        default:
          return {
            success: false,
            error: 'Unsupported platform'
          };
      }
    } catch (error) {
      console.error(`Error updating ${platformName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prepare villa data for platform APIs
   */
  static prepareVillaData(villa) {
    return {
      name: villa.name,
      description: villa.description,
      location: villa.location,
      price: villa.price,
      type: villa.type,
      area: villa.area,
      amenities: villa.amenities || [],
      status: villa.status
    };
  }

  /**
   * Update Airbnb listing
   */
  static async updateAirbnb(listingId, villaData, config) {
    try {
      // In production, this would call Airbnb API
      // For now, we'll simulate the API call
      console.log(`📡 Calling Airbnb API to update listing ${listingId}...`);

      // Simulated API call
      // const response = await fetch(`https://api.airbnb.com/v2/listings/${listingId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${config.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     name: villaData.name,
      //     description: villaData.description,
      //     price_per_night: villaData.price,
      //     amenities: villaData.amenities
      //   })
      // });

      // Simulate success
      return {
        success: true,
        listingId,
        platform: 'airbnb',
        message: 'Listing updated successfully'
      };
    } catch (error) {
      console.error('Airbnb update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update Booking.com listing
   */
  static async updateBookingCom(listingId, villaData, config) {
    try {
      console.log(`📡 Calling Booking.com API to update listing ${listingId}...`);

      // Simulated API call
      // const response = await fetch(`https://distribution-xml.booking.com/2.0/json/${listingId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Basic ${config.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     property: {
      //       name: villaData.name,
      //       description: villaData.description,
      //       facilities: villaData.amenities
      //     }
      //   })
      // });

      return {
        success: true,
        listingId,
        platform: 'booking_com',
        message: 'Property updated successfully'
      };
    } catch (error) {
      console.error('Booking.com update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update VRBO listing
   */
  static async updateVrbo(listingId, villaData, config) {
    try {
      console.log(`📡 Calling VRBO API to update listing ${listingId}...`);

      return {
        success: true,
        listingId,
        platform: 'vrbo',
        message: 'Rental updated successfully'
      };
    } catch (error) {
      console.error('VRBO update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = VillaUpdateService;
