/**
 * Calendar Sync Router
 *
 * API routes for calendar synchronization and iCal management
 */

const express = require("express");
const router = express.Router();
const CalendarSyncService = require("../services/CalendarSyncService");
const Villa = require("../Models/villaModel");
const auth = require("../Middleware/AuthMiddleware");

const calendarService = new CalendarSyncService();

/**
 * Export villa calendar to iCal format
 */
router.get("/calendar/export/:villaId", auth, async (req, res) => {
  try {
    const { villaId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify villa ownership
    const villa = await Villa.findOne({
      _id: villaId,
      owner: req.user.id
    });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found or access denied"
      });
    }

    const icalContent = await calendarService.exportToICal(
      villaId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    // Set headers for iCal file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${villa.name}-calendar.ics"`);
    res.send(icalContent);
  } catch (error) {
    console.error("Error exporting calendar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export calendar",
      error: error.message
    });
  }
});

/**
 * Import bookings from iCal URL
 */
router.post("/calendar/import", auth, async (req, res) => {
  try {
    const { villaId, icalUrl, source } = req.body;

    if (!villaId || !icalUrl) {
      return res.status(400).json({
        success: false,
        message: "Villa ID and iCal URL are required"
      });
    }

    // Verify villa ownership
    const villa = await Villa.findOne({
      _id: villaId,
      owner: req.user.id
    });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found or access denied"
      });
    }

    // Validate iCal URL
    const isValid = await calendarService.validateICalUrl(icalUrl);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid iCal URL or URL is not accessible"
      });
    }

    const result = await calendarService.importFromICal(
      villaId,
      icalUrl,
      source || 'external'
    );

    res.json({
      success: true,
      message: `Calendar imported successfully`,
      data: result
    });
  } catch (error) {
    console.error("Error importing calendar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import calendar",
      error: error.message
    });
  }
});

/**
 * Sync calendar across all platforms for a villa
 */
router.post("/calendar/sync-all", auth, async (req, res) => {
  try {
    const { villaId } = req.body;

    if (!villaId) {
      return res.status(400).json({
        success: false,
        message: "Villa ID is required"
      });
    }

    // Verify villa ownership
    const villa = await Villa.findOne({
      _id: villaId,
      owner: req.user.id
    });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found or access denied"
      });
    }

    const result = await calendarService.syncAllPlatforms(villaId, req.user.id);

    res.json({
      success: true,
      message: "Calendar sync completed",
      data: result
    });
  } catch (error) {
    console.error("Error syncing calendar:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync calendar",
      error: error.message
    });
  }
});

/**
 * Check for booking conflicts
 */
router.post("/calendar/check-conflicts", auth, async (req, res) => {
  try {
    const { villaId, startDate, endDate } = req.body;

    if (!villaId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Villa ID, start date, and end date are required"
      });
    }

    // Verify villa ownership
    const villa = await Villa.findOne({
      _id: villaId,
      owner: req.user.id
    });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found or access denied"
      });
    }

    const conflict = await calendarService.checkConflict(
      villaId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      hasConflict: !!conflict,
      conflict: conflict || null
    });
  } catch (error) {
    console.error("Error checking conflicts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check conflicts",
      error: error.message
    });
  }
});

/**
 * Update availability across all platforms
 */
router.post("/calendar/update-availability", auth, async (req, res) => {
  try {
    const { villaId, dates, available } = req.body;

    if (!villaId || !dates || !Array.isArray(dates)) {
      return res.status(400).json({
        success: false,
        message: "Villa ID and dates array are required"
      });
    }

    // Verify villa ownership
    const villa = await Villa.findOne({
      _id: villaId,
      owner: req.user.id
    });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found or access denied"
      });
    }

    const result = await calendarService.updatePlatformAvailability(
      villaId,
      dates,
      available
    );

    res.json({
      success: result.success,
      message: result.success
        ? `Availability updated for ${dates.length} dates`
        : "Failed to update availability on all platforms",
      data: result
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message
    });
  }
});

/**
 * Get iCal feed URL for a villa (public endpoint)
 */
router.get("/calendar/ical/:villaId", async (req, res) => {
  try {
    const { villaId } = req.params;
    const { token } = req.query;

    // Basic token validation (you might want to implement more secure validation)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token required"
      });
    }

    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found"
      });
    }

    const icalContent = await calendarService.exportToICal(villaId);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.send(icalContent);
  } catch (error) {
    console.error("Error serving iCal feed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate calendar feed",
      error: error.message
    });
  }
});

/**
 * Get iCal feed URL for a villa
 */
router.get("/calendar/feed-url/:villaId", auth, async (req, res) => {
  try {
    const { villaId } = req.params;

    // Verify villa ownership
    const villa = await Villa.findOne({
      _id: villaId,
      owner: req.user.id
    });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: "Villa not found or access denied"
      });
    }

    const feedUrl = calendarService.generateICalFeedUrl(villaId);

    res.json({
      success: true,
      feedUrl,
      message: "Use this URL to subscribe to the calendar in external applications"
    });
  } catch (error) {
    console.error("Error generating feed URL:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate feed URL",
      error: error.message
    });
  }
});

module.exports = router;