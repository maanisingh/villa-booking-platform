/**
 * Email Configuration Router
 *
 * API routes for email/SMTP configuration
 */

const express = require("express");
const router = express.Router();
const EmailConfigController = require("../Controller/EmailConfig.Controller");
const auth = require("../Middleware/AuthMiddleware");

// Get email configuration
router.get("/email/config", auth, EmailConfigController.getEmailConfig);

// Configure email settings
router.post("/email/configure", auth, EmailConfigController.configureEmail);

// Configure with predefined provider
router.post("/email/configure-provider", auth, EmailConfigController.configureWithProvider);

// Update notification settings
router.put("/email/notifications", auth, EmailConfigController.updateNotificationSettings);

// Test email configuration
router.post("/email/test", auth, EmailConfigController.testEmailConfig);

// Enable email configuration
router.post("/email/enable", auth, EmailConfigController.enableEmailConfig);

// Disable email configuration
router.post("/email/disable", auth, EmailConfigController.disableEmailConfig);

// Delete email configuration
router.delete("/email/config", auth, EmailConfigController.deleteEmailConfig);

// Get email statistics
router.get("/email/statistics", auth, EmailConfigController.getEmailStatistics);

module.exports = router;