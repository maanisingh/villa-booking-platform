/**
 * Platform Integration Router
 *
 * API routes for platform integration management
 * Handles platform connections, sync operations, and integration settings
 */

const express = require("express");
const router = express.Router();
const PlatformIntegrationController = require("../Controller/PlatformIntegration.Controller");
const auth = require("../Middleware/AuthMiddleware");

// Get all platform integrations for user
router.get("/platforms", auth, PlatformIntegrationController.getUserIntegrations);

// Get specific integration details
router.get("/platforms/:id", auth, PlatformIntegrationController.getIntegration);

// Connect to a new platform
router.post("/platforms/connect", auth, PlatformIntegrationController.connectPlatform);

// Test platform connection
router.post("/platforms/test-connection", auth, PlatformIntegrationController.testConnection);

// Update platform integration settings
router.put("/platforms/:id", auth, PlatformIntegrationController.updateIntegration);

// Disconnect from a platform
router.delete("/platforms/:id", auth, PlatformIntegrationController.disconnectPlatform);

// Manual sync for a specific platform
router.post("/platforms/:platform/sync", auth, PlatformIntegrationController.syncPlatform);

// Sync all platforms for user
router.post("/platforms/sync-all", auth, PlatformIntegrationController.syncAllPlatforms);

// Get sync history
router.get("/sync/history", auth, PlatformIntegrationController.getSyncHistory);

// Get sync statistics
router.get("/sync/statistics", auth, PlatformIntegrationController.getSyncStatistics);

module.exports = router;