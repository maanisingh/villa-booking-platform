/**
 * Cron Job Service
 *
 * Manages scheduled tasks for automatic booking synchronization
 * and other periodic operations
 */

const cron = require("node-cron");
const BookingSyncService = require("./BookingSyncService");
const PlatformIntegration = require("../Models/PlatformIntegration.Model");

class CronJobService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Initialize all cron jobs
   */
  static init() {
    const instance = new CronJobService();

    // Main sync job - runs every 2 hours
    instance.scheduleBookingSync();

    // Daily cleanup job - runs at 2 AM
    instance.scheduleCleanup();

    // Health check job - runs every 30 minutes
    instance.scheduleHealthCheck();

    console.log("✓ Cron job scheduler initialized");
    console.log("  - Booking sync: Every 2 hours");
    console.log("  - Cleanup: Daily at 2:00 AM");
    console.log("  - Health check: Every 30 minutes");

    return instance;
  }

  /**
   * Schedule automatic booking synchronization
   */
  scheduleBookingSync() {
    // Run every 2 hours
    const job = cron.schedule("0 */2 * * *", async () => {
      console.log(`[${new Date().toISOString()}] Starting scheduled booking sync...`);

      try {
        // Get all active integrations with autoSync enabled
        const integrations = await PlatformIntegration.find({
          status: "active",
          autoSync: true,
        });

        console.log(`Found ${integrations.length} active integrations to sync`);

        const results = {
          successful: 0,
          failed: 0,
          totalNewBookings: 0,
          totalUpdatedBookings: 0,
          errors: []
        };

        // Process each integration
        for (const integration of integrations) {
          try {
            // Check if sync is needed based on frequency
            if (this.shouldSync(integration)) {
              const syncResult = await BookingSyncService.syncPlatform(
                integration.userId,
                integration.platform
              );

              if (syncResult.status === "success") {
                results.successful++;
                results.totalNewBookings += syncResult.newBookings;
                results.totalUpdatedBookings += syncResult.updatedBookings;
                console.log(
                  `✓ Synced ${integration.platform} for user ${integration.userId}: ` +
                  `${syncResult.newBookings} new, ${syncResult.updatedBookings} updated`
                );
              } else {
                results.failed++;
                results.errors.push({
                  platform: integration.platform,
                  userId: integration.userId,
                  error: syncResult.errorMessages
                });
                console.error(
                  `✗ Failed to sync ${integration.platform} for user ${integration.userId}`
                );
              }
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              platform: integration.platform,
              userId: integration.userId,
              error: error.message
            });
            console.error(
              `✗ Error syncing ${integration.platform}:`,
              error.message
            );
          }
        }

        // Log summary
        console.log(`[${new Date().toISOString()}] Scheduled sync completed:`);
        console.log(`  - Successful syncs: ${results.successful}`);
        console.log(`  - Failed syncs: ${results.failed}`);
        console.log(`  - New bookings: ${results.totalNewBookings}`);
        console.log(`  - Updated bookings: ${results.totalUpdatedBookings}`);

        if (results.errors.length > 0) {
          console.log(`  - Errors:`, results.errors);
        }

      } catch (error) {
        console.error("Cron job error:", error);
      }
    });

    this.jobs.set("bookingSync", job);
    job.start();
  }

  /**
   * Schedule daily cleanup tasks
   */
  scheduleCleanup() {
    // Run daily at 2:00 AM
    const job = cron.schedule("0 2 * * *", async () => {
      console.log(`[${new Date().toISOString()}] Starting daily cleanup...`);

      try {
        // Clean up old sync logs (keep last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const SyncLog = require("../Models/SyncLog.Model");
        const deleteResult = await SyncLog.deleteMany({
          createdAt: { $lt: thirtyDaysAgo }
        });

        console.log(`  - Deleted ${deleteResult.deletedCount} old sync logs`);

        // Clean up expired bookings
        const Booking = require("../Models/OwnerBooking.Model");
        const expiredBookings = await Booking.updateMany(
          {
            endDate: { $lt: new Date() },
            status: { $in: ["Pending", "Confirmed"] }
          },
          {
            $set: { status: "Completed" }
          }
        );

        console.log(`  - Marked ${expiredBookings.modifiedCount} bookings as completed`);

        // Reset failed integrations that haven't been checked in 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const resetIntegrations = await PlatformIntegration.updateMany(
          {
            status: "error",
            lastSync: { $lt: sevenDaysAgo }
          },
          {
            $set: { status: "inactive" }
          }
        );

        console.log(`  - Reset ${resetIntegrations.modifiedCount} failed integrations`);

        console.log(`[${new Date().toISOString()}] Daily cleanup completed`);

      } catch (error) {
        console.error("Cleanup job error:", error);
      }
    });

    this.jobs.set("cleanup", job);
    job.start();
  }

  /**
   * Schedule health check for integrations
   */
  scheduleHealthCheck() {
    // Run every 30 minutes
    const job = cron.schedule("*/30 * * * *", async () => {
      try {
        // Get all active integrations
        const integrations = await PlatformIntegration.find({
          status: "active"
        });

        let healthyCount = 0;
        let unhealthyCount = 0;

        for (const integration of integrations) {
          try {
            // Get service and test connection
            const ServiceClass = BookingSyncService.getServiceClass(integration.platform);
            if (ServiceClass) {
              const service = new ServiceClass(integration.getDecryptedCredentials());
              const testResult = await service.testConnection();

              if (!testResult.success) {
                unhealthyCount++;
                // Mark integration as having issues
                await PlatformIntegration.findByIdAndUpdate(integration._id, {
                  $set: {
                    lastHealthCheck: new Date(),
                    healthStatus: "unhealthy",
                    healthMessage: testResult.message
                  }
                });
              } else {
                healthyCount++;
                // Mark as healthy
                await PlatformIntegration.findByIdAndUpdate(integration._id, {
                  $set: {
                    lastHealthCheck: new Date(),
                    healthStatus: "healthy",
                    healthMessage: null
                  }
                });
              }
            }
          } catch (error) {
            unhealthyCount++;
            console.error(`Health check failed for ${integration.platform}:`, error.message);
          }
        }

        if (unhealthyCount > 0) {
          console.log(`[${new Date().toISOString()}] Health check: ${healthyCount} healthy, ${unhealthyCount} unhealthy`);
        }

      } catch (error) {
        console.error("Health check error:", error);
      }
    });

    this.jobs.set("healthCheck", job);
    job.start();
  }

  /**
   * Check if an integration should be synced based on frequency
   */
  shouldSync(integration) {
    if (!integration.lastSync) {
      return true; // Never synced before
    }

    const now = new Date();
    const lastSync = new Date(integration.lastSync);
    const hoursSinceLastSync = (now - lastSync) / (1000 * 60 * 60);

    // Default to 2 hours if syncFrequency not set
    const syncFrequency = integration.syncFrequency || 2;

    return hoursSinceLastSync >= syncFrequency;
  }

  /**
   * Schedule a custom job
   */
  scheduleCustomJob(name, cronExpression, handler) {
    if (this.jobs.has(name)) {
      console.warn(`Job ${name} already exists. Stopping old job...`);
      this.stopJob(name);
    }

    const job = cron.schedule(cronExpression, handler, {
      scheduled: false
    });

    this.jobs.set(name, job);
    job.start();

    console.log(`Custom job '${name}' scheduled with expression: ${cronExpression}`);
    return job;
  }

  /**
   * Stop a specific job
   */
  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`Job '${name}' stopped`);
      return true;
    }
    return false;
  }

  /**
   * Stop all jobs
   */
  stopAll() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }
    this.jobs.clear();
    this.isRunning = false;
    console.log("All cron jobs stopped");
  }

  /**
   * Start all jobs
   */
  startAll() {
    for (const [name, job] of this.jobs) {
      job.start();
      console.log(`Started job: ${name}`);
    }
    this.isRunning = true;
    console.log("All cron jobs started");
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: []
    };

    for (const [name, job] of this.jobs) {
      status.jobs.push({
        name,
        running: job.running !== false
      });
    }

    return status;
  }

  /**
   * Manual trigger for testing
   */
  static async triggerManualSync() {
    console.log("Manually triggering booking sync...");

    try {
      const integrations = await PlatformIntegration.find({
        status: "active",
        autoSync: true,
      });

      const results = [];

      for (const integration of integrations) {
        try {
          const result = await BookingSyncService.syncPlatform(
            integration.userId,
            integration.platform
          );
          results.push(result);
        } catch (error) {
          results.push({
            platform: integration.platform,
            userId: integration.userId,
            status: "failed",
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CronJobService;