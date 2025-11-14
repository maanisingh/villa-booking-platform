/**
 * Admin Villa Integration Router
 *
 * API routes for admin management of villa-specific platform integrations
 */

const express = require("express");
const router = express.Router();
const AdminVillaIntegrationController = require("../Controller/AdminVillaIntegration.Controller");
const auth = require("../Middleware/AuthMiddleware");
const adminAuth = require("../Middleware/AdminMiddleware");

// Admin-only routes (requires both authentication and admin role)

// Get all villa integrations
router.get(
  "/admin/villa-integrations",
  auth,
  adminAuth,
  AdminVillaIntegrationController.getAllVillaIntegrations
);

// Get integrations for a specific villa
router.get(
  "/admin/villa-integrations/villa/:villaId",
  auth,
  adminAuth,
  AdminVillaIntegrationController.getVillaIntegrations
);

// Get integrations for a specific owner
router.get(
  "/admin/villa-integrations/owner/:ownerId",
  auth,
  adminAuth,
  AdminVillaIntegrationController.getOwnerIntegrations
);

// Get integration statistics
router.get(
  "/admin/villa-integrations/stats",
  auth,
  adminAuth,
  AdminVillaIntegrationController.getIntegrationStats
);

// Add new villa integration
router.post(
  "/admin/villa-integrations",
  auth,
  adminAuth,
  AdminVillaIntegrationController.addVillaIntegration
);

// Update villa integration
router.put(
  "/admin/villa-integrations/:id",
  auth,
  adminAuth,
  AdminVillaIntegrationController.updateVillaIntegration
);

// Delete villa integration
router.delete(
  "/admin/villa-integrations/:id",
  auth,
  adminAuth,
  AdminVillaIntegrationController.deleteVillaIntegration
);

// Manually sync a specific villa integration
router.post(
  "/admin/villa-integrations/:id/sync",
  auth,
  adminAuth,
  AdminVillaIntegrationController.syncVillaIntegration
);

module.exports = router;
