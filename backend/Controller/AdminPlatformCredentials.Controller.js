/**
 * Admin Platform Credentials Controller
 *
 * Handles API endpoints for admin management of global platform credentials
 */

const PlatformCredentials = require("../Models/PlatformCredentials.Model");
const BookingSyncService = require("../services/BookingSyncService");

class AdminPlatformCredentialsController {
  /**
   * Get all platform credentials (Admin only)
   */
  static async getAllCredentials(req, res) {
    try {
      const credentials = await PlatformCredentials.find()
        .populate('createdBy', 'name email')
        .select("-credentials.apiSecret -credentials.password -credentials.refreshToken -credentials.clientSecret")
        .sort({ platform: 1, credentialName: 1 });

      res.json({
        success: true,
        data: credentials,
        count: credentials.length
      });
    } catch (error) {
      console.error("Error fetching platform credentials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch platform credentials",
        error: error.message
      });
    }
  }

  /**
   * Get credentials for a specific platform
   */
  static async getCredentialsByPlatform(req, res) {
    try {
      const { platform } = req.params;

      const credentials = await PlatformCredentials.find({
        platform,
        isActive: true
      })
        .populate('createdBy', 'name email')
        .select("-credentials.apiSecret -credentials.password -credentials.refreshToken -credentials.clientSecret")
        .sort({ credentialName: 1 });

      res.json({
        success: true,
        data: credentials,
        count: credentials.length
      });
    } catch (error) {
      console.error("Error fetching credentials by platform:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch credentials",
        error: error.message
      });
    }
  }

  /**
   * Get a single credential by ID (with decrypted credentials)
   */
  static async getCredentialById(req, res) {
    try {
      const { id } = req.params;

      const credential = await PlatformCredentials.findById(id)
        .populate('createdBy', 'name email');

      if (!credential) {
        return res.status(404).json({
          success: false,
          message: "Credential not found"
        });
      }

      // Get decrypted credentials for internal use
      const decryptedCredentials = credential.getDecryptedCredentials();

      const responseData = credential.toObject();
      responseData.credentials = decryptedCredentials;

      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error("Error fetching credential:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch credential",
        error: error.message
      });
    }
  }

  /**
   * Add new platform credentials
   */
  static async addCredentials(req, res) {
    try {
      const { platform, credentialName, credentials, description } = req.body;

      // Validate required fields
      if (!platform || !credentialName || !credentials) {
        return res.status(400).json({
          success: false,
          message: "Platform, credential name, and credentials are required"
        });
      }

      // Check for duplicate credential name for this platform
      const existing = await PlatformCredentials.findOne({
        platform,
        credentialName
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A credential with name "${credentialName}" already exists for ${platform}. Please use a different name.`
        });
      }

      // Validate credentials
      const validationResult = await BookingSyncService.validateCredentials(
        platform,
        credentials
      );

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: `Invalid credentials: ${validationResult.message}`
        });
      }

      // Get admin user ID from request (assuming it's set by auth middleware)
      const createdBy = req.user?.id || req.user?._id || req.body.createdBy;

      if (!createdBy) {
        return res.status(401).json({
          success: false,
          message: "User authentication required"
        });
      }

      // Create credential
      const newCredential = await PlatformCredentials.create({
        platform,
        credentialName,
        credentials,
        description,
        createdBy,
        isActive: true
      });

      // Populate creator details
      await newCredential.populate('createdBy', 'name email');

      // Remove sensitive data from response
      const responseData = newCredential.toObject();
      if (responseData.credentials) {
        delete responseData.credentials.apiSecret;
        delete responseData.credentials.password;
        delete responseData.credentials.refreshToken;
        delete responseData.credentials.clientSecret;
      }

      res.status(201).json({
        success: true,
        message: "Platform credentials added successfully",
        data: responseData
      });
    } catch (error) {
      console.error("Error adding platform credentials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add platform credentials",
        error: error.message
      });
    }
  }

  /**
   * Update platform credentials
   */
  static async updateCredentials(req, res) {
    try {
      const { id } = req.params;
      const { credentialName, credentials, isActive, description } = req.body;

      const credential = await PlatformCredentials.findById(id);

      if (!credential) {
        return res.status(404).json({
          success: false,
          message: "Credential not found"
        });
      }

      // Check if credential name is being changed and if it conflicts
      if (credentialName && credentialName !== credential.credentialName) {
        const existing = await PlatformCredentials.findOne({
          platform: credential.platform,
          credentialName,
          _id: { $ne: id }
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: `A credential with name "${credentialName}" already exists for ${credential.platform}`
          });
        }

        credential.credentialName = credentialName;
      }

      // Update credentials if provided
      if (credentials) {
        const validationResult = await BookingSyncService.validateCredentials(
          credential.platform,
          credentials
        );

        if (!validationResult.success) {
          return res.status(400).json({
            success: false,
            message: `Invalid credentials: ${validationResult.message}`
          });
        }

        credential.credentials = credentials;
      }

      // Update other fields
      if (isActive !== undefined) credential.isActive = isActive;
      if (description !== undefined) credential.description = description;

      await credential.save();

      // Populate details
      await credential.populate('createdBy', 'name email');

      // Remove sensitive data
      const responseData = credential.toObject();
      if (responseData.credentials) {
        delete responseData.credentials.apiSecret;
        delete responseData.credentials.password;
        delete responseData.credentials.refreshToken;
        delete responseData.credentials.clientSecret;
      }

      res.json({
        success: true,
        message: "Credentials updated successfully",
        data: responseData
      });
    } catch (error) {
      console.error("Error updating credentials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update credentials",
        error: error.message
      });
    }
  }

  /**
   * Delete platform credentials
   */
  static async deleteCredentials(req, res) {
    try {
      const { id } = req.params;

      const credential = await PlatformCredentials.findByIdAndDelete(id);

      if (!credential) {
        return res.status(404).json({
          success: false,
          message: "Credential not found"
        });
      }

      res.json({
        success: true,
        message: `Successfully deleted credentials: ${credential.credentialName}`
      });
    } catch (error) {
      console.error("Error deleting credentials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete credentials",
        error: error.message
      });
    }
  }

  /**
   * Get platform credentials statistics
   */
  static async getStats(req, res) {
    try {
      const totalCredentials = await PlatformCredentials.countDocuments();
      const activeCredentials = await PlatformCredentials.countDocuments({ isActive: true });
      const inactiveCredentials = await PlatformCredentials.countDocuments({ isActive: false });

      const platformBreakdown = await PlatformCredentials.aggregate([
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 },
            active: {
              $sum: { $cond: ["$isActive", 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          totalCredentials,
          activeCredentials,
          inactiveCredentials,
          platformBreakdown
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error: error.message
      });
    }
  }
}

module.exports = AdminPlatformCredentialsController;
