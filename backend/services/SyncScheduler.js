/**
 * Sync Scheduler Service
 *
 * This service manages automated synchronization scheduling using cron jobs
 * Handles periodic sync operations for all active platform integrations
 *
 * Features:
 * - Automated booking sync every 15 minutes (configurable)
 * - Daily calendar sync
 * - Error handling and retry logic
 * - Sync status monitoring
 */

const cron = require('node-cron');
const BookingSyncService = require('./BookingSyncService');
const CalendarSyncService = require('./CalendarSyncService');
const PlatformIntegration = require('../Models/PlatformIntegration.Model');
const SyncLog = require('../Models/SyncLog.Model');
const EmailService = require('./EmailService');

class SyncScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
    this.syncInProgress = false;
    this.calendarSyncService = new CalendarSyncService();
  }

  /**
   * Initialize and start all scheduled jobs
   */
  init() {
    try {
      // Quick sync - Every 15 minutes
      this.scheduleQuickSync();

      // Full sync - Every 2 hours
      this.scheduleFullSync();

      // Calendar sync - Every hour
      this.scheduleCalendarSync();

      // Cleanup old logs - Daily at 2 AM
      this.scheduleCleanup();

      // Health check - Every 5 minutes
      this.scheduleHealthCheck();

      this.isRunning = true;
      console.log(' Sync Scheduler initialized successfully');
      console.log('  - Quick sync: Every 15 minutes');
      console.log('  - Full sync: Every 2 hours');
      console.log('  - Calendar sync: Every hour');
      console.log('  - Cleanup: Daily at 2 AM');
      console.log('  - Health check: Every 5 minutes');

      return true;
    } catch (error) {
      console.error('Failed to initialize Sync Scheduler:', error);
      return false;
    }
  }

  /**
   * Schedule quick sync (new bookings only) - Every 15 minutes
   */
  scheduleQuickSync() {
    const job = cron.schedule('*/15 * * * *', async () => {
      if (this.syncInProgress) {
        console.log('Skipping quick sync - Another sync is in progress');
        return;
      }

      console.log('Starting quick sync...');
      this.syncInProgress = true;
      const startTime = Date.now();

      try {
        // Get all active integrations with auto-sync enabled
        const integrations = await PlatformIntegration.find({
          status: 'active',
          autoSync: true,
          // Only sync if last sync was more than 14 minutes ago
          $or: [
            { lastSync: { $lt: new Date(Date.now() - 14 * 60 * 1000) } },
            { lastSync: null }
          ]
        });

        console.log(`Found ${integrations.length} platforms to sync`);

        const syncResults = [];
        for (const integration of integrations) {
          try {
            const result = await BookingSyncService.syncPlatform(
              integration.userId,
              integration.platform
            );

            syncResults.push({
              platform: integration.platform,
              userId: integration.userId,
              success: result.status === 'success',
              newBookings: result.newBookings,
              errors: result.errorCount
            });

            console.log(` Synced ${integration.platform} for user ${integration.userId}`);
          } catch (error) {
            console.error(
              ` Failed to sync ${integration.platform} for user ${integration.userId}:`,
              error.message
            );
          }

          // Small delay between platform syncs to avoid rate limiting
          await this.delay(2000);
        }

        const duration = Date.now() - startTime;
        console.log(`Quick sync completed in ${Math.round(duration / 1000)}s`);

        // Log summary
        const successful = syncResults.filter(r => r.success).length;
        const failed = syncResults.filter(r => !r.success).length;
        const totalNewBookings = syncResults.reduce((sum, r) => sum + (r.newBookings || 0), 0);

        if (totalNewBookings > 0 || failed > 0) {
          console.log(`Sync summary: ${successful} successful, ${failed} failed, ${totalNewBookings} new bookings`);
        }
      } catch (error) {
        console.error('Quick sync error:', error);
      } finally {
        this.syncInProgress = false;
      }
    });

    this.jobs.set('quickSync', job);
  }

  /**
   * Schedule full sync (all bookings and updates) - Every 2 hours
   */
  scheduleFullSync() {
    const job = cron.schedule('0 */2 * * *', async () => {
      if (this.syncInProgress) {
        console.log('Skipping full sync - Another sync is in progress');
        return;
      }

      console.log('Starting full sync...');
      this.syncInProgress = true;
      const startTime = Date.now();

      try {
        // Get all active integrations
        const integrations = await PlatformIntegration.find({
          status: 'active',
          autoSync: true
        });

        const results = [];
        for (const integration of integrations) {
          try {
            console.log(`Full sync for ${integration.platform} - User: ${integration.userId}`);

            const result = await BookingSyncService.syncPlatform(
              integration.userId,
              integration.platform
            );

            results.push({
              userId: integration.userId,
              platform: integration.platform,
              ...result
            });

            // Send summary email if there were significant changes
            if (result.newBookings > 5 || result.errorCount > 0) {
              try {
                await EmailService.sendSyncReport(
                  integration.userId,
                  integration.platform,
                  result
                );
              } catch (emailError) {
                console.error('Failed to send sync report email:', emailError);
              }
            }
          } catch (error) {
            console.error(
              `Full sync failed for ${integration.platform}:`,
              error.message
            );
          }

          // Longer delay for full sync
          await this.delay(5000);
        }

        const duration = Date.now() - startTime;
        console.log(`Full sync completed in ${Math.round(duration / 1000)}s`);

        // Log individual results instead of creating a summary log without required fields
        // Each platform sync already creates its own SyncLog entry
        console.log('Full sync summary:', {
          totalPlatforms: results.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'failed').length,
          totalNewBookings: results.reduce((sum, r) => sum + (r.newBookings || 0), 0),
          totalUpdated: results.reduce((sum, r) => sum + (r.updatedBookings || 0), 0)
        });
      } catch (error) {
        console.error('Full sync error:', error);
      } finally {
        this.syncInProgress = false;
      }
    });

    this.jobs.set('fullSync', job);
  }

  /**
   * Schedule calendar sync - Every hour
   */
  scheduleCalendarSync() {
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Starting calendar sync...');

      try {
        // Get villas with calendar sync enabled
        const Villa = require('../Models/villaModel');
        const villas = await Villa.find({
          calendarSyncEnabled: true,
          iCalUrl: { $exists: true, $ne: null }
        });

        for (const villa of villas) {
          try {
            if (villa.iCalUrl) {
              const result = await this.calendarSyncService.importFromICal(
                villa._id,
                villa.iCalUrl,
                'iCal'
              );

              if (result.imported > 0 || result.updated > 0) {
                console.log(
                  `Calendar sync for villa ${villa._id}: ${result.imported} imported, ${result.updated} updated`
                );
              }
            }
          } catch (error) {
            console.error(`Calendar sync failed for villa ${villa._id}:`, error.message);
          }
        }
      } catch (error) {
        console.error('Calendar sync error:', error);
      }
    });

    this.jobs.set('calendarSync', job);
  }

  /**
   * Schedule cleanup of old logs - Daily at 2 AM
   */
  scheduleCleanup() {
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('Starting cleanup of old sync logs...');

      try {
        // Delete logs older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await SyncLog.deleteMany({
          createdAt: { $lt: thirtyDaysAgo }
        });

        console.log(`Cleanup completed: Deleted ${result.deletedCount} old sync logs`);

        // Also cleanup orphaned bookings
        const Booking = require('../Models/OwnerBooking.Model');
        const orphanedBookings = await Booking.deleteMany({
          lastSyncTime: { $lt: thirtyDaysAgo },
          status: 'Cancelled',
          manuallyCreated: { $ne: true }
        });

        if (orphanedBookings.deletedCount > 0) {
          console.log(`Deleted ${orphanedBookings.deletedCount} orphaned cancelled bookings`);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });

    this.jobs.set('cleanup', job);
  }

  /**
   * Schedule health check - Every 5 minutes
   */
  scheduleHealthCheck() {
    const job = cron.schedule('*/5 * * * *', async () => {
      try {
        // Check for stuck syncs
        const stuckSyncs = await SyncLog.find({
          status: 'in_progress',
          createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes old
        });

        if (stuckSyncs.length > 0) {
          console.warn(`Found ${stuckSyncs.length} stuck syncs, marking as failed`);

          for (const sync of stuckSyncs) {
            await SyncLog.findByIdAndUpdate(sync._id, {
              status: 'failed',
              errorMessages: [{ message: 'Sync timeout - marked as failed by health check' }]
            });
          }
        }

        // Check platform connection health
        const integrations = await PlatformIntegration.find({
          status: 'active',
          lastSync: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // No sync in 24 hours
        });

        if (integrations.length > 0) {
          console.warn(`${integrations.length} platforms haven't synced in 24 hours`);

          // Test connections
          for (const integration of integrations) {
            try {
              const ServiceClass = BookingSyncService.getServiceClass(integration.platform);
              if (ServiceClass) {
                const service = new ServiceClass(integration.getDecryptedCredentials());
                const testResult = await service.testConnection();

                if (!testResult.success) {
                  console.error(
                    `Platform ${integration.platform} for user ${integration.userId} is not responding`
                  );

                  // Mark as having connection issues
                  await PlatformIntegration.findByIdAndUpdate(integration._id, {
                    connectionStatus: 'error',
                    connectionError: testResult.message
                  });
                }
              }
            } catch (error) {
              console.error(`Health check failed for ${integration.platform}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error('Health check error:', error);
      }
    });

    this.jobs.set('healthCheck', job);
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('Stopping Sync Scheduler...');

    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`  - Stopped ${name}`);
    }

    this.jobs.clear();
    this.isRunning = false;
    console.log('Sync Scheduler stopped');
  }

  /**
   * Restart all scheduled jobs
   */
  restart() {
    this.stop();
    return this.init();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const jobStatus = {};

    for (const [name, job] of this.jobs) {
      jobStatus[name] = {
        running: job.running !== undefined ? job.running : true,
        nextRun: job.nextDates ? job.nextDates(1)[0] : null
      };
    }

    return {
      isRunning: this.isRunning,
      syncInProgress: this.syncInProgress,
      jobs: jobStatus,
      totalJobs: this.jobs.size
    };
  }

  /**
   * Trigger manual sync for a specific platform
   */
  async triggerManualSync(userId, platform) {
    if (this.syncInProgress) {
      return {
        success: false,
        message: 'Another sync is already in progress'
      };
    }

    try {
      this.syncInProgress = true;
      const result = await BookingSyncService.syncPlatform(userId, platform);

      return {
        success: result.status === 'success',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Helper function to create delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get next scheduled runs
   */
  getNextRuns() {
    const nextRuns = [];

    for (const [name, job] of this.jobs) {
      if (job.nextDates) {
        const next = job.nextDates(1);
        if (next && next[0]) {
          nextRuns.push({
            job: name,
            nextRun: next[0],
            timeUntil: next[0] - new Date()
          });
        }
      }
    }

    return nextRuns.sort((a, b) => a.nextRun - b.nextRun);
  }
}

// Create singleton instance
const syncScheduler = new SyncScheduler();

module.exports = syncScheduler;