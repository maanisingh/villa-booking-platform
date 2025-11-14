/**
 * Email Configuration Controller
 *
 * Handles email/SMTP configuration management
 */

const EmailConfig = require("../Models/EmailConfig.Model");
const EmailService = require("../services/EmailService");

class EmailConfigController {
  /**
   * Get email configuration for the user
   */
  static async getEmailConfig(req, res) {
    try {
      const config = await EmailConfig.findOne({
        userId: req.user.id
      }).select("-smtpPassword"); // Don't send password to frontend

      if (!config) {
        return res.json({
          success: true,
          data: null,
          message: "No email configuration found"
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error("Error fetching email config:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch email configuration",
        error: error.message
      });
    }
  }

  /**
   * Configure email settings
   */
  static async configureEmail(req, res) {
    try {
      const {
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName,
        provider,
        notificationSettings
      } = req.body;

      // Validate required fields
      if (!smtpHost || !smtpPort || !smtpUser || !fromEmail) {
        return res.status(400).json({
          success: false,
          message: "Missing required SMTP configuration fields"
        });
      }

      // Check if configuration already exists
      let config = await EmailConfig.findOne({ userId: req.user.id });

      const configData = {
        userId: req.user.id,
        smtpHost,
        smtpPort: parseInt(smtpPort),
        smtpSecure: smtpSecure !== false,
        smtpUser,
        fromEmail,
        fromName: fromName || "Villa Booking Platform",
        provider: provider || "custom",
        isActive: true
      };

      // Only update password if provided
      if (smtpPassword) {
        configData.smtpPassword = smtpPassword;
      }

      // Add notification settings if provided
      if (notificationSettings) {
        configData.notificationSettings = notificationSettings;
      }

      if (config) {
        // Update existing configuration
        Object.assign(config, configData);
        await config.save();
      } else {
        // Create new configuration
        if (!smtpPassword) {
          return res.status(400).json({
            success: false,
            message: "Password is required for initial configuration"
          });
        }
        config = await EmailConfig.create(configData);
      }

      // Return without password
      const responseData = config.toObject();
      delete responseData.smtpPassword;

      res.json({
        success: true,
        message: "Email configuration saved successfully",
        data: responseData
      });
    } catch (error) {
      console.error("Error configuring email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save email configuration",
        error: error.message
      });
    }
  }

  /**
   * Configure using predefined provider settings
   */
  static async configureWithProvider(req, res) {
    try {
      const { provider, email, password, fromName } = req.body;

      // Validate required fields
      if (!provider || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Provider, email, and password are required"
        });
      }

      // Get provider settings
      const providerSettings = {
        gmail: {
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpSecure: false
        },
        outlook: {
          smtpHost: "smtp-mail.outlook.com",
          smtpPort: 587,
          smtpSecure: false
        },
        yahoo: {
          smtpHost: "smtp.mail.yahoo.com",
          smtpPort: 587,
          smtpSecure: false
        },
        sendgrid: {
          smtpHost: "smtp.sendgrid.net",
          smtpPort: 587,
          smtpSecure: false
        },
        mailgun: {
          smtpHost: "smtp.mailgun.org",
          smtpPort: 587,
          smtpSecure: false
        }
      };

      const settings = providerSettings[provider.toLowerCase()];

      if (!settings) {
        return res.status(400).json({
          success: false,
          message: `Unknown email provider: ${provider}`
        });
      }

      // Create configuration
      const configData = {
        userId: req.user.id,
        ...settings,
        smtpUser: email,
        smtpPassword: password,
        fromEmail: email,
        fromName: fromName || "Villa Booking Platform",
        provider: provider.toLowerCase(),
        isActive: true
      };

      // Check if configuration already exists
      let config = await EmailConfig.findOne({ userId: req.user.id });

      if (config) {
        Object.assign(config, configData);
        await config.save();
      } else {
        config = await EmailConfig.create(configData);
      }

      // Return without password
      const responseData = config.toObject();
      delete responseData.smtpPassword;

      res.json({
        success: true,
        message: `Email configured with ${provider}`,
        data: responseData
      });
    } catch (error) {
      console.error("Error configuring email with provider:", error);
      res.status(500).json({
        success: false,
        message: "Failed to configure email",
        error: error.message
      });
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(req, res) {
    try {
      const { notificationSettings } = req.body;

      const config = await EmailConfig.findOne({ userId: req.user.id });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Email configuration not found. Please configure email first."
        });
      }

      // Update notification settings
      config.notificationSettings = {
        ...config.notificationSettings,
        ...notificationSettings
      };

      await config.save();

      // Return without password
      const responseData = config.toObject();
      delete responseData.smtpPassword;

      res.json({
        success: true,
        message: "Notification settings updated",
        data: responseData
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update notification settings",
        error: error.message
      });
    }
  }

  /**
   * Test email configuration
   */
  static async testEmailConfig(req, res) {
    try {
      const { toEmail } = req.body;

      if (!toEmail) {
        return res.status(400).json({
          success: false,
          message: "Recipient email address is required"
        });
      }

      // Check if email is configured
      const config = await EmailConfig.findOne({
        userId: req.user.id,
        isActive: true
      });

      if (!config) {
        return res.status(400).json({
          success: false,
          message: "Email is not configured. Please configure email settings first."
        });
      }

      // Send test email
      const result = await EmailService.sendTestEmail(req.user.id, toEmail);

      if (result.success) {
        // Update last test timestamp
        config.lastTestAt = new Date();
        config.lastTestResult = true;
        await config.save();

        res.json({
          success: true,
          message: `Test email sent successfully to ${toEmail}`,
          data: result
        });
      } else {
        // Update failure status
        config.lastTestAt = new Date();
        config.lastTestResult = false;
        await config.save();

        res.status(400).json({
          success: false,
          message: `Failed to send test email: ${result.error}`,
          error: result.error
        });
      }
    } catch (error) {
      console.error("Error testing email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error: error.message
      });
    }
  }

  /**
   * Disable email configuration
   */
  static async disableEmailConfig(req, res) {
    try {
      const config = await EmailConfig.findOne({ userId: req.user.id });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Email configuration not found"
        });
      }

      config.isActive = false;
      await config.save();

      res.json({
        success: true,
        message: "Email configuration disabled"
      });
    } catch (error) {
      console.error("Error disabling email config:", error);
      res.status(500).json({
        success: false,
        message: "Failed to disable email configuration",
        error: error.message
      });
    }
  }

  /**
   * Enable email configuration
   */
  static async enableEmailConfig(req, res) {
    try {
      const config = await EmailConfig.findOne({ userId: req.user.id });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Email configuration not found"
        });
      }

      config.isActive = true;
      await config.save();

      res.json({
        success: true,
        message: "Email configuration enabled"
      });
    } catch (error) {
      console.error("Error enabling email config:", error);
      res.status(500).json({
        success: false,
        message: "Failed to enable email configuration",
        error: error.message
      });
    }
  }

  /**
   * Delete email configuration
   */
  static async deleteEmailConfig(req, res) {
    try {
      const result = await EmailConfig.findOneAndDelete({
        userId: req.user.id
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Email configuration not found"
        });
      }

      res.json({
        success: true,
        message: "Email configuration deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting email config:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete email configuration",
        error: error.message
      });
    }
  }

  /**
   * Get email statistics
   */
  static async getEmailStatistics(req, res) {
    try {
      const config = await EmailConfig.findOne({ userId: req.user.id });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Email configuration not found"
        });
      }

      const stats = {
        isActive: config.isActive,
        provider: config.provider,
        emailsSent: config.emailsSent || 0,
        lastEmailSentAt: config.lastEmailSentAt,
        lastTestAt: config.lastTestAt,
        lastTestResult: config.lastTestResult,
        createdAt: config.createdAt,
        notificationSettings: config.notificationSettings
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching email statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch email statistics",
        error: error.message
      });
    }
  }
}

module.exports = EmailConfigController;