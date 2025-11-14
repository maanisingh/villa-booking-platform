/**
 * Booking Synchronization Service
 *
 * Handles synchronization of bookings across multiple platforms
 * Manages sync operations, conflict resolution, and sync logging
 */

const PlatformIntegration = require("../Models/PlatformIntegration.Model");
const Booking = require("../Models/OwnerBooking.Model");
const SyncLog = require("../Models/SyncLog.Model");
const Villa = require("../Models/villaModel");
const EmailService = require("./EmailService");
const AirbnbService = require("./integrations/AirbnbService");
const BookingComService = require("./integrations/BookingComService");
const VRBOService = require("./integrations/VRBOService");
const ExpediaService = require("./integrations/ExpediaService");

class BookingSyncService {
  /**
   * Get the appropriate service class for a platform
   */
  static getServiceClass(platform) {
    const services = {
      airbnb: AirbnbService,
      booking_com: BookingComService,
      vrbo: VRBOService,
      expedia: ExpediaService,
    };
    return services[platform];
  }

  /**
   * Sync bookings from a specific platform for a user
   */
  static async syncPlatform(userId, platform) {
    const startTime = Date.now();
    const syncLog = {
      userId,
      platform,
      syncType: "manual",
      status: "success",
      newBookings: 0,
      updatedBookings: 0,
      skippedBookings: 0,
      errorCount: 0,
      errorMessages: [],
    };

    try {
      // Get platform integration
      const integration = await PlatformIntegration.findOne({
        userId,
        platform,
        status: "active",
      });

      if (!integration) {
        throw new Error(`No active ${platform} integration found`);
      }

      // Get service class and credentials
      const ServiceClass = this.getServiceClass(platform);
      if (!ServiceClass) {
        throw new Error(`Unknown platform: ${platform}`);
      }

      const credentials = integration.getDecryptedCredentials();
      const service = new ServiceClass(credentials);

      // Test connection first
      const connectionTest = await service.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      // Fetch bookings from platform
      const result = await service.fetchBookings();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Process each booking
      for (const externalBooking of result.bookings) {
        try {
          const transformedBooking = service.transformBooking(externalBooking);

          // Check if booking already exists
          const existingBooking = await Booking.findOne({
            externalBookingId: transformedBooking.externalBookingId,
          });

          if (existingBooking) {
            // Check if booking needs update
            if (this.hasBookingChanged(existingBooking, transformedBooking)) {
              await Booking.findByIdAndUpdate(
                existingBooking._id,
                {
                  ...transformedBooking,
                  lastSyncTime: new Date()
                }
              );
              syncLog.updatedBookings++;
            } else {
              syncLog.skippedBookings++;
            }
          } else {
            // Create new booking
            await Booking.create({
              ...transformedBooking,
              ownerId: userId,
            });
            syncLog.newBookings++;
          }
        } catch (error) {
          syncLog.errorCount++;
          syncLog.errorMessages.push({
            message: error.message,
            bookingId: externalBooking.id || externalBooking.reservation_id || 'unknown',
            timestamp: new Date(),
          });
        }
      }

      // Update integration with sync results
      await PlatformIntegration.findByIdAndUpdate(integration._id, {
        lastSync: new Date(),
        lastSyncResult: {
          newBookings: syncLog.newBookings,
          updatedBookings: syncLog.updatedBookings,
          errors: syncLog.errorCount,
        },
        totalBookingsSynced:
          integration.totalBookingsSynced + syncLog.newBookings,
      });
    } catch (error) {
      syncLog.status = "failed";
      syncLog.errorCount++;
      syncLog.errorMessages.push({
        message: error.message,
        timestamp: new Date(),
      });
    }

    // Calculate duration
    syncLog.duration = Date.now() - startTime;

    // Save sync log
    await SyncLog.create(syncLog);

    // Send email notification if configured
    if (syncLog.newBookings > 0 || syncLog.updatedBookings > 0) {
      try {
        await EmailService.sendSyncReport(userId, platform, syncLog);
      } catch (emailError) {
        console.error('Failed to send sync email notification:', emailError);
      }
    }

    return syncLog;
  }

  /**
   * Sync all active platforms for a user
   */
  static async syncAllPlatforms(userId) {
    const integrations = await PlatformIntegration.find({
      userId,
      status: "active",
      autoSync: true,
    });

    const results = [];

    for (const integration of integrations) {
      const result = await this.syncPlatform(userId, integration.platform);
      results.push(result);
    }

    return results;
  }

  /**
   * Sync all users' platforms (used by cron job)
   */
  static async syncAllUsersAndPlatforms() {
    const integrations = await PlatformIntegration.find({
      status: "active",
      autoSync: true,
    });

    const results = [];
    const userPlatformMap = {};

    // Group integrations by user
    integrations.forEach(integration => {
      if (!userPlatformMap[integration.userId]) {
        userPlatformMap[integration.userId] = [];
      }
      userPlatformMap[integration.userId].push(integration.platform);
    });

    // Sync each user's platforms
    for (const [userId, platforms] of Object.entries(userPlatformMap)) {
      for (const platform of platforms) {
        try {
          const result = await this.syncPlatform(userId, platform);
          results.push({
            userId,
            platform,
            ...result
          });
        } catch (error) {
          console.error(`Failed to sync ${platform} for user ${userId}:`, error);
          results.push({
            userId,
            platform,
            status: "failed",
            error: error.message
          });
        }
      }
    }

    return results;
  }

  /**
   * Check if a booking has changed
   */
  static hasBookingChanged(existingBooking, newBookingData) {
    const fieldsToCheck = [
      'guestName',
      'totalFare',
      'status',
      'startDate',
      'endDate'
    ];

    for (const field of fieldsToCheck) {
      if (field === 'startDate' || field === 'endDate') {
        const existingDate = new Date(existingBooking[field]).toISOString();
        const newDate = new Date(newBookingData[field]).toISOString();
        if (existingDate !== newDate) {
          return true;
        }
      } else if (existingBooking[field] !== newBookingData[field]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get sync history for a user
   */
  static async getSyncHistory(userId, limit = 10) {
    return await SyncLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Get sync statistics for a user
   */
  static async getSyncStatistics(userId) {
    const integrations = await PlatformIntegration.find({ userId });
    const syncLogs = await SyncLog.find({ userId });

    const stats = {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.status === 'active').length,
      totalSyncs: syncLogs.length,
      successfulSyncs: syncLogs.filter(l => l.status === 'success').length,
      failedSyncs: syncLogs.filter(l => l.status === 'failed').length,
      totalBookingsSynced: 0,
      totalErrors: 0,
      platformStats: {}
    };

    // Calculate per-platform statistics
    integrations.forEach(integration => {
      stats.totalBookingsSynced += integration.totalBookingsSynced || 0;

      stats.platformStats[integration.platform] = {
        status: integration.status,
        lastSync: integration.lastSync,
        totalBookings: integration.totalBookingsSynced || 0,
        autoSync: integration.autoSync
      };
    });

    // Count total errors from sync logs
    syncLogs.forEach(log => {
      stats.totalErrors += log.errorCount || 0;
    });

    return stats;
  }

  /**
   * Manual booking conflict resolution
   */
  static async resolveBookingConflict(bookingId, resolution) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    switch (resolution) {
      case 'keep_local':
        // Mark as manually resolved, don't sync this booking
        booking.manuallyResolved = true;
        booking.resolutionNote = 'Kept local version';
        break;

      case 'update_from_platform':
        // Re-sync this specific booking from platform
        await this.resyncBooking(booking);
        break;

      case 'delete':
        // Delete the booking
        await Booking.findByIdAndDelete(bookingId);
        return { success: true, message: 'Booking deleted' };

      default:
        throw new Error('Invalid resolution type');
    }

    await booking.save();
    return { success: true, booking };
  }

  /**
   * Re-sync a specific booking from its platform
   */
  static async resyncBooking(booking) {
    if (!booking.externalBookingId || !booking.syncedFrom) {
      throw new Error('Cannot resync booking without external reference');
    }

    const integration = await PlatformIntegration.findOne({
      userId: booking.ownerId,
      platform: booking.syncedFrom,
      status: 'active'
    });

    if (!integration) {
      throw new Error('Platform integration not found or inactive');
    }

    const ServiceClass = this.getServiceClass(booking.syncedFrom);
    const service = new ServiceClass(integration.getDecryptedCredentials());

    // Fetch single booking from platform (would need platform-specific implementation)
    const result = await service.fetchBookings();
    const externalBooking = result.bookings?.find(
      b => (b.id || b.reservation_id || b.reservationId) === booking.externalBookingId
    );

    if (externalBooking) {
      const transformedBooking = service.transformBooking(externalBooking);
      await Booking.findByIdAndUpdate(booking._id, transformedBooking);
      return { success: true, message: 'Booking resynced successfully' };
    } else {
      throw new Error('Booking not found on platform');
    }
  }

  /**
   * Validate platform credentials
   */
  static async validateCredentials(platform, credentials) {
    const ServiceClass = this.getServiceClass(platform);

    if (!ServiceClass) {
      return { success: false, message: 'Unknown platform' };
    }

    try {
      const service = new ServiceClass(credentials);
      return await service.testConnection();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Sync a specific villa integration
   */
  static async syncVillaIntegration(integration) {
    const startTime = Date.now();
    const result = {
      success: false,
      newBookings: 0,
      updatedBookings: 0,
      skippedBookings: 0,
      errorCount: 0,
      message: ''
    };

    try {
      // Get service class
      const ServiceClass = this.getServiceClass(integration.platform);
      if (!ServiceClass) {
        throw new Error(`Unknown platform: ${integration.platform}`);
      }

      // Get decrypted credentials
      const credentials = integration.getDecryptedCredentials();
      const service = new ServiceClass(credentials);

      // Test connection
      const connectionTest = await service.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      // Fetch bookings
      const fetchResult = await service.fetchBookings();
      if (!fetchResult.success) {
        throw new Error(fetchResult.error);
      }

      // Process bookings
      for (const externalBooking of fetchResult.bookings) {
        try {
          const transformedBooking = service.transformBooking(externalBooking);

          // Add villa and owner IDs
          transformedBooking.villaId = integration.villaId;
          transformedBooking.ownerId = integration.ownerId;
          transformedBooking.platform = integration.platform;

          // Check if booking exists
          const existing = await Booking.findOne({
            externalBookingId: transformedBooking.externalBookingId
          });

          if (existing) {
            if (this.hasBookingChanged(existing, transformedBooking)) {
              await Booking.findByIdAndUpdate(existing._id, {
                ...transformedBooking,
                lastSyncTime: new Date()
              });
              result.updatedBookings++;
            } else {
              result.skippedBookings++;
            }
          } else {
            await Booking.create({
              ...transformedBooking,
              lastSyncTime: new Date()
            });
            result.newBookings++;
          }
        } catch (error) {
          console.error('Error processing booking:', error);
          result.errorCount++;
        }
      }

      result.success = true;
      result.message = `Synced ${result.newBookings} new and ${result.updatedBookings} updated bookings`;

      // Log sync
      await SyncLog.create({
        userId: integration.ownerId,
        villaId: integration.villaId,
        platform: integration.platform,
        syncType: 'manual',
        status: 'success',
        newBookings: result.newBookings,
        updatedBookings: result.updatedBookings,
        skippedBookings: result.skippedBookings,
        errorCount: result.errorCount,
        duration: Date.now() - startTime
      });

    } catch (error) {
      console.error('Villa integration sync error:', error);
      result.success = false;
      result.message = error.message;
      result.errorCount++;

      // Log failed sync
      await SyncLog.create({
        userId: integration.ownerId,
        villaId: integration.villaId,
        platform: integration.platform,
        syncType: 'manual',
        status: 'failed',
        errorCount: 1,
        errorMessages: [error.message],
        duration: Date.now() - startTime
      });
    }

    return result;
  }
}

module.exports = BookingSyncService;