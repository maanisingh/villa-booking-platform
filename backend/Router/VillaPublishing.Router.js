/**
 * Villa Publishing Router
 *
 * API routes for publishing villas to platforms
 */

const express = require("express");
const router = express.Router();
const VillaPublishingController = require("../Controller/VillaPublishing.Controller");
const auth = require("../Middleware/AuthMiddleware");

// Get publishing status for a villa
router.get("/villas/:villaId/publishing-status", auth, VillaPublishingController.getPublishingStatus);

// Publish villa to a specific platform
router.post("/villas/:villaId/publish", auth, VillaPublishingController.publishToPlatform);

// Publish villa to multiple platforms
router.post("/villas/:villaId/publish-multiple", auth, VillaPublishingController.publishToMultiplePlatforms);

// Update villa listing on a platform
router.put("/villas/:villaId/platforms/:platform", auth, VillaPublishingController.updatePlatformListing);

// Remove villa from a platform
router.delete("/villas/:villaId/platforms/:platform", auth, VillaPublishingController.unpublishFromPlatform);

// Sync availability across platforms
router.post("/villas/:villaId/sync-availability", auth, VillaPublishingController.syncAvailability);

module.exports = router;