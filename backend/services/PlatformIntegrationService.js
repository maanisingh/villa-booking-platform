/**
 * Base Platform Integration Service
 *
 * Abstract base class for all platform integration services
 * Provides common functionality and interface that all platform services must implement
 */

class PlatformIntegrationService {
  constructor(credentials) {
    if (this.constructor === PlatformIntegrationService) {
      throw new Error("Cannot instantiate abstract class PlatformIntegrationService directly");
    }

    this.credentials = credentials;
    this.isConnected = false;
    this.lastSyncTime = null;
    this.errors = [];
  }

  /**
   * Test connection to the platform API
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async testConnection() {
    throw new Error("testConnection() must be implemented by subclass");
  }

  /**
   * Publish a villa listing to the platform
   * @param {Object} villaData - Villa information to publish
   * @returns {Promise<{success: boolean, listingId?: string, error?: string}>}
   */
  async publishListing(villaData) {
    throw new Error("publishListing() must be implemented by subclass");
  }

  /**
   * Update an existing listing
   * @param {string} listingId - Platform-specific listing ID
   * @param {Object} villaData - Updated villa information
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateListing(listingId, villaData) {
    throw new Error("updateListing() must be implemented by subclass");
  }

  /**
   * Delete a listing from the platform
   * @param {string} listingId - Platform-specific listing ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteListing(listingId) {
    throw new Error("deleteListing() must be implemented by subclass");
  }

  /**
   * Fetch bookings from the platform
   * @param {string} villaId - Villa ID to fetch bookings for
   * @param {Date} startDate - Start date for booking search
   * @param {Date} endDate - End date for booking search
   * @returns {Promise<{success: boolean, bookings: Array, error?: string}>}
   */
  async fetchBookings(villaId = null, startDate = null, endDate = null) {
    throw new Error("fetchBookings() must be implemented by subclass");
  }

  /**
   * Fetch availability calendar
   * @param {string} listingId - Platform-specific listing ID
   * @param {Date} startDate - Start date for calendar
   * @param {Date} endDate - End date for calendar
   * @returns {Promise<{success: boolean, calendar: Array, error?: string}>}
   */
  async fetchCalendar(listingId, startDate, endDate) {
    throw new Error("fetchCalendar() must be implemented by subclass");
  }

  /**
   * Transform platform booking to internal format
   * @param {Object} platformBooking - Booking data from platform
   * @returns {Object} - Transformed booking in internal format
   */
  transformBooking(platformBooking) {
    throw new Error("transformBooking() must be implemented by subclass");
  }

  /**
   * Map platform status to internal status
   * @param {string} platformStatus - Status from platform
   * @returns {string} - Internal status
   */
  mapStatus(platformStatus) {
    throw new Error("mapStatus() must be implemented by subclass");
  }

  /**
   * Validate villa data before publishing
   * @param {Object} villaData - Villa data to validate
   * @returns {Object} - Validation result {isValid: boolean, errors: Array}
   */
  validateVillaData(villaData) {
    const errors = [];

    // Common validation rules
    if (!villaData.name || villaData.name.trim() === '') {
      errors.push('Villa name is required');
    }

    if (!villaData.description || villaData.description.trim() === '') {
      errors.push('Villa description is required');
    }

    if (!villaData.price || villaData.price <= 0) {
      errors.push('Valid price is required');
    }

    if (!villaData.location) {
      errors.push('Location is required');
    }

    if (!villaData.type) {
      errors.push('Villa type/bedrooms is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format date for API calls
   * @param {Date|string} date - Date to format
   * @returns {string} - Formatted date string
   */
  formatDate(date) {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) return null;

    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }

  /**
   * Parse API response errors
   * @param {Object} error - Error object from API
   * @returns {string} - User-friendly error message
   */
  parseError(error) {
    if (error.response) {
      // API returned an error response
      if (error.response.data && error.response.data.message) {
        return error.response.data.message;
      }
      return `API Error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received
      return 'No response from platform API. Please check your connection.';
    } else {
      // Error in setting up the request
      return error.message || 'Unknown error occurred';
    }
  }

  /**
   * Log activity for debugging
   * @param {string} action - Action being performed
   * @param {Object} data - Data associated with the action
   */
  logActivity(action, data = {}) {
    const logEntry = {
      timestamp: new Date(),
      action,
      platform: this.constructor.name.replace('Service', ''),
      data
    };

    console.log(`[${logEntry.platform}] ${action}:`, data);

    // Could also save to database or external logging service
    return logEntry;
  }

  /**
   * Rate limit handler
   * @param {Function} apiCall - API call to rate limit
   * @param {number} delay - Delay in milliseconds
   */
  async rateLimitedCall(apiCall, delay = 1000) {
    await new Promise(resolve => setTimeout(resolve, delay));
    return apiCall();
  }

  /**
   * Batch process multiple operations
   * @param {Array} items - Items to process
   * @param {Function} processor - Function to process each item
   * @param {number} batchSize - Number of items to process at once
   */
  async batchProcess(items, processor, batchSize = 10) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item).catch(err => ({ error: err.message })))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Retry failed operations
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   */
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logActivity('Retry attempt', { attempt, maxRetries, error: error.message });

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if service is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.credentials && Object.keys(this.credentials).length > 0;
  }

  /**
   * Get service health status
   * @returns {Object}
   */
  async getHealthStatus() {
    const status = {
      service: this.constructor.name,
      configured: this.isConfigured(),
      connected: false,
      lastSync: this.lastSyncTime,
      errors: this.errors.slice(-5) // Last 5 errors
    };

    if (this.isConfigured()) {
      const connectionTest = await this.testConnection();
      status.connected = connectionTest.success;
      if (!connectionTest.success) {
        status.connectionError = connectionTest.message;
      }
    }

    return status;
  }
}

module.exports = PlatformIntegrationService;