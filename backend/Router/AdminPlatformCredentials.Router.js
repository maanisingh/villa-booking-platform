/**
 * Admin Platform Credentials Router
 *
 * Routes for managing global platform credentials
 */

const express = require("express");
const router = express.Router();
const AdminPlatformCredentialsController = require("../Controller/AdminPlatformCredentials.Controller");

// Get all platform credentials
router.get(
  "/admin/platform-credentials",
  AdminPlatformCredentialsController.getAllCredentials
);

// Get credentials for a specific platform
router.get(
  "/admin/platform-credentials/platform/:platform",
  AdminPlatformCredentialsController.getCredentialsByPlatform
);

// Get a single credential by ID
router.get(
  "/admin/platform-credentials/:id",
  AdminPlatformCredentialsController.getCredentialById
);

// Add new platform credentials
router.post(
  "/admin/platform-credentials",
  AdminPlatformCredentialsController.addCredentials
);

// Update platform credentials
router.put(
  "/admin/platform-credentials/:id",
  AdminPlatformCredentialsController.updateCredentials
);

// Delete platform credentials
router.delete(
  "/admin/platform-credentials/:id",
  AdminPlatformCredentialsController.deleteCredentials
);

// Get statistics
router.get(
  "/admin/platform-credentials-stats",
  AdminPlatformCredentialsController.getStats
);

module.exports = router;
