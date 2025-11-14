/**
 * BookingPlatformSync.js
 * Syncs booking operations (create/update/delete) to external platforms
 * (Airbnb, Booking.com, VRBO, Expedia)
 */

class BookingPlatformSync {
  /**
   * Sync booking creation to platform
   * @param {Object} villaIntegration - The VillaIntegration document
   * @param {Object} booking - The Booking document
   * @returns {Promise<Object>} - Sync result
   */
  static async syncCreateBooking(villaIntegration, booking) {
    try {
      const platform = villaIntegration.platform;

      console.log(`📤 Syncing new booking ${booking._id} to ${platform}...`);

      // Mock sync logic (replace with actual API calls later)
      const syncResult = await this._mockPlatformSync(platform, 'create', booking, villaIntegration);

      return {
        success: true,
        platform: platform,
        action: 'create',
        bookingId: booking._id,
        externalId: syncResult.externalId,
        message: `Booking successfully synced to ${platform}`,
        syncedAt: new Date()
      };
    } catch (error) {
      console.error(`❌ Failed to sync booking to ${villaIntegration.platform}:`, error.message);
      return {
        success: false,
        platform: villaIntegration.platform,
        action: 'create',
        bookingId: booking._id,
        error: error.message,
        syncedAt: new Date()
      };
    }
  }

  /**
   * Sync booking update to platform
   * @param {Object} villaIntegration - The VillaIntegration document
   * @param {Object} booking - The updated Booking document
   * @returns {Promise<Object>} - Sync result
   */
  static async syncUpdateBooking(villaIntegration, booking) {
    try {
      const platform = villaIntegration.platform;

      console.log(`📤 Syncing booking update ${booking._id} to ${platform}...`);

      // Mock sync logic
      const syncResult = await this._mockPlatformSync(platform, 'update', booking, villaIntegration);

      return {
        success: true,
        platform: platform,
        action: 'update',
        bookingId: booking._id,
        externalId: syncResult.externalId,
        message: `Booking update successfully synced to ${platform}`,
        syncedAt: new Date()
      };
    } catch (error) {
      console.error(`❌ Failed to sync booking update to ${villaIntegration.platform}:`, error.message);
      return {
        success: false,
        platform: villaIntegration.platform,
        action: 'update',
        bookingId: booking._id,
        error: error.message,
        syncedAt: new Date()
      };
    }
  }

  /**
   * Sync booking deletion to platform
   * @param {Object} villaIntegration - The VillaIntegration document
   * @param {Object} booking - The Booking document to delete
   * @returns {Promise<Object>} - Sync result
   */
  static async syncDeleteBooking(villaIntegration, booking) {
    try {
      const platform = villaIntegration.platform;

      console.log(`📤 Syncing booking deletion ${booking._id} to ${platform}...`);

      // Mock sync logic
      const syncResult = await this._mockPlatformSync(platform, 'delete', booking, villaIntegration);

      return {
        success: true,
        platform: platform,
        action: 'delete',
        bookingId: booking._id,
        message: `Booking deletion successfully synced to ${platform}`,
        syncedAt: new Date()
      };
    } catch (error) {
      console.error(`❌ Failed to sync booking deletion to ${villaIntegration.platform}:`, error.message);
      return {
        success: false,
        platform: villaIntegration.platform,
        action: 'delete',
        bookingId: booking._id,
        error: error.message,
        syncedAt: new Date()
      };
    }
  }

  /**
   * Mock platform sync (replace with actual API integration)
   * @private
   */
  static async _mockPlatformSync(platform, action, booking, villaIntegration) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock external booking ID generation
    const externalId = `${platform.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`✅ Mock ${action} sync to ${platform} completed`);
    console.log(`   Guest: ${booking.guestName}`);
    console.log(`   Dates: ${booking.startDate} to ${booking.endDate}`);
    console.log(`   External ID: ${externalId}`);

    // In production, this would make actual API calls to:
    // - Airbnb API: https://api.airbnb.com/v2/calendars
    // - Booking.com API: https://supply-xml.booking.com/hotels/ota
    // - VRBO/Expedia API: https://services.expediapartnercentral.com
    // etc.

    return {
      externalId: externalId,
      platform: platform,
      status: 'synced'
    };
  }

  /**
   * Sync booking to all active platforms for a villa
   * @param {String} villaId - The villa ID
   * @param {Object} booking - The booking document
   * @param {String} action - 'create', 'update', or 'delete'
   * @returns {Promise<Object>} - Combined sync results
   */
  static async syncToAllPlatforms(villaId, booking, action = 'create') {
    try {
      const VillaIntegration = require('../Models/VillaIntegration.Model');

      // Find all active integrations for this villa
      const integrations = await VillaIntegration.find({
        villaId: villaId,
        status: 'active'
      });

      if (!integrations || integrations.length === 0) {
        return {
          success: true,
          syncedPlatforms: 0,
          message: 'No active platform integrations found for this villa',
          results: []
        };
      }

      // Sync to all platforms
      const syncPromises = integrations.map(integration => {
        switch(action) {
          case 'create':
            return this.syncCreateBooking(integration, booking);
          case 'update':
            return this.syncUpdateBooking(integration, booking);
          case 'delete':
            return this.syncDeleteBooking(integration, booking);
          default:
            return Promise.resolve({ success: false, error: 'Invalid action' });
        }
      });

      const results = await Promise.all(syncPromises);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      return {
        success: successCount > 0,
        syncedPlatforms: successCount,
        failedPlatforms: failCount,
        totalPlatforms: integrations.length,
        message: `Synced to ${successCount}/${integrations.length} platforms`,
        results: results
      };
    } catch (error) {
      console.error('❌ Error syncing to all platforms:', error);
      return {
        success: false,
        syncedPlatforms: 0,
        error: error.message,
        results: []
      };
    }
  }
}

module.exports = BookingPlatformSync;
