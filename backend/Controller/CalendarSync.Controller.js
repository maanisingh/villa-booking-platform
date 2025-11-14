/**
 * Calendar Sync Controller
 *
 * Handles calendar synchronization, iCal import/export, and availability management
 */

const CalendarSyncService = require("../services/CalendarSyncService");
const Villa = require("../Models/villaModel");
const Booking = require("../Models/OwnerBooking.Model");
const SyncLog = require("../Models/SyncLog.Model");

/**
 * Get all villas with their calendar URLs
 */
exports.getVillaCalendars = async (req, res) => {
  try {
    const userId = req.user.id;

    const villas = await Villa.find({ ownerId: userId });

    const villasWithCalendars = villas.map((villa) => ({
      id: villa._id,
      name: villa.villaName,
      iCalUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/calendar/ical/${villa._id}`,
      platforms: villa.publishedPlatforms || [],
      externalListingIds: villa.externalListingIds || {},
    }));

    res.status(200).json({
      success: true,
      data: villasWithCalendars,
    });
  } catch (error) {
    console.error("Get Villa Calendars Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch villa calendars",
      error: error.message,
    });
  }
};

/**
 * Export iCal calendar for a villa
 */
exports.exportIcal = async (req, res) => {
  try {
    const { villaId } = req.params;

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found",
      });
    }

    const bookings = await Booking.find({ villaId });
    const icalData = await CalendarSyncService.exportToICal(villa, bookings);

    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="${villa.villaName.replace(/\s+/g, "_")}_calendar.ics"`);
    res.send(icalData);
  } catch (error) {
    console.error("Export iCal Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export calendar",
      error: error.message,
    });
  }
};

/**
 * Import iCal calendar for a villa
 */
exports.importIcal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { villaId } = req.params;
    const { icalUrl, platform } = req.body;

    if (!icalUrl) {
      return res.status(400).json({
        success: false,
        message: "iCal URL is required",
      });
    }

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found",
      });
    }

    // Import calendar
    const result = await CalendarSyncService.importFromICal(icalUrl, villaId, platform);

    // Create sync log
    await SyncLog.create({
      userId,
      platform: platform || "iCal Import",
      syncType: "calendar",
      status: "success",
      itemsProcessed: result.bookingsCreated.length,
      itemsSynced: result.bookingsCreated.length,
      itemsFailed: 0,
      details: {
        villaId,
        icalUrl,
        bookingsCreated: result.bookingsCreated.length,
      },
    });

    res.status(200).json({
      success: true,
      message: "Calendar imported successfully",
      data: result,
    });
  } catch (error) {
    console.error("Import iCal Error:", error);

    // Log failed sync
    try {
      await SyncLog.create({
        userId: req.user.id,
        platform: req.body.platform || "iCal Import",
        syncType: "calendar",
        status: "failed",
        error: error.message,
      });
    } catch (logError) {
      console.error("Failed to create sync log:", logError);
    }

    res.status(500).json({
      success: false,
      message: "Failed to import calendar",
      error: error.message,
    });
  }
};

/**
 * Check for calendar conflicts
 */
exports.checkConflicts = async (req, res) => {
  try {
    const { villaId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const hasConflict = await CalendarSyncService.checkForConflicts(
      villaId,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({
      success: true,
      hasConflict,
      message: hasConflict ? "Booking conflicts detected" : "No conflicts found",
    });
  } catch (error) {
    console.error("Check Conflicts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check conflicts",
      error: error.message,
    });
  }
};

/**
 * Update villa availability across all platforms
 */
exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { villaId } = req.params;
    const { startDate, endDate, available } = req.body;

    if (!startDate || !endDate || available === undefined) {
      return res.status(400).json({
        success: false,
        message: "Start date, end date, and availability status are required",
      });
    }

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found",
      });
    }

    const result = await CalendarSyncService.updateVillaAvailability(
      villaId,
      new Date(startDate),
      new Date(endDate),
      available
    );

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Availability Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message,
    });
  }
};

/**
 * Get calendar sync status for a villa
 */
exports.getSyncStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { villaId } = req.params;

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found",
      });
    }

    // Get recent sync logs
    const syncLogs = await SyncLog.find({
      userId,
      syncType: "calendar",
      "details.villaId": villaId,
    })
      .sort({ syncStartTime: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        villaId,
        villaName: villa.villaName,
        lastSync: syncLogs[0] || null,
        recentSyncs: syncLogs,
        platforms: villa.publishedPlatforms || [],
      },
    });
  } catch (error) {
    console.error("Get Sync Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sync status",
      error: error.message,
    });
  }
};

/**
 * Sync calendar for specific villa
 */
exports.syncVillaCalendar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { villaId } = req.params;

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found",
      });
    }

    // Perform sync
    const result = await CalendarSyncService.syncVillaCalendar(villaId);

    // Create sync log
    await SyncLog.create({
      userId,
      platform: "Multi-Platform",
      syncType: "calendar",
      status: "success",
      itemsProcessed: result.totalProcessed || 0,
      itemsSynced: result.synced || 0,
      itemsFailed: result.failed || 0,
      details: {
        villaId,
        platforms: villa.publishedPlatforms || [],
        result,
      },
    });

    res.status(200).json({
      success: true,
      message: "Calendar synced successfully",
      data: result,
    });
  } catch (error) {
    console.error("Sync Villa Calendar Error:", error);

    // Log failed sync
    try {
      await SyncLog.create({
        userId: req.user.id,
        platform: "Multi-Platform",
        syncType: "calendar",
        status: "failed",
        error: error.message,
      });
    } catch (logError) {
      console.error("Failed to create sync log:", logError);
    }

    res.status(500).json({
      success: false,
      message: "Failed to sync calendar",
      error: error.message,
    });
  }
};

module.exports = exports;
