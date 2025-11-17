/**
 * Calendar Synchronization Service
 *
 * This service handles iCal import/export and multi-platform calendar synchronization
 * Provides conflict detection, availability management, and automated sync scheduling
 *
 * Features:
 * - iCal format support (RFC 5545)
 * - Multi-platform calendar sync
 * - Conflict detection and resolution
 * - Availability blocking across platforms
 */

const ical = require('ical-generator');
const icalParser = require('node-ical');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Villa = require('../Models/villaModel');
const Booking = require('../Models/OwnerBooking.Model');
const PlatformIntegration = require('../Models/PlatformIntegration.Model');
const SyncLog = require('../Models/SyncLog.Model');

class CalendarSyncService {
  constructor() {
    this.platforms = ['airbnb', 'booking_com', 'vrbo', 'expedia'];
    this.syncConflicts = [];
  }

  /**
   * Export villa calendar to iCal format
   * @param {String} villaId Villa ID
   * @param {Date} startDate Start date for calendar export
   * @param {Date} endDate End date for calendar export
   * @returns {String} iCal formatted string
   */
  async exportToICal(villaId, startDate = null, endDate = null) {
    try {
      // Set default date range if not provided
      const start = startDate || new Date();
      const end = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

      // Fetch villa and bookings
      const villa = await Villa.findById(villaId);
      if (!villa) {
        throw new Error('Villa not found');
      }

      const bookings = await Booking.find({
        villaId,
        startDate: { $gte: start },
        endDate: { $lte: end },
        status: { $in: ['Confirmed', 'Active'] }
      });

      // Create iCal calendar
      const calendar = ical({
        name: `${villa.name} - Availability Calendar`,
        description: `Booking calendar for ${villa.name}`,
        timezone: 'UTC',
        prodId: {
          company: 'Villa Booking Platform',
          product: 'Calendar Sync',
          language: 'EN'
        }
      });

      // Add bookings as events
      bookings.forEach(booking => {
        calendar.createEvent({
          start: booking.startDate,
          end: booking.endDate,
          summary: `Booked: ${booking.guestName || 'Guest'}`,
          description: `Booking from ${booking.bookingSource}\nStatus: ${booking.status}\nTotal: ${booking.totalFare} ${booking.currency || 'USD'}`,
          status: 'CONFIRMED',
          busyStatus: 'BUSY',
          uid: booking.externalBookingId || booking._id.toString(),
          categories: [booking.bookingSource],
          organizer: {
            name: villa.ownerName || 'Villa Owner',
            email: villa.ownerEmail || 'owner@villa.com'
          }
        });
      });

      // Add blocked dates
      if (villa.blockedDates && villa.blockedDates.length > 0) {
        villa.blockedDates.forEach(blockedDate => {
          if (blockedDate >= start && blockedDate <= end) {
            calendar.createEvent({
              start: blockedDate,
              end: new Date(blockedDate.getTime() + 24 * 60 * 60 * 1000),
              summary: 'Blocked',
              description: 'Date blocked by owner',
              status: 'CONFIRMED',
              busyStatus: 'BUSY',
              uid: `blocked_${blockedDate.toISOString()}`
            });
          }
        });
      }

      return calendar.toString();
    } catch (error) {
      console.error('Failed to export calendar:', error);
      throw new Error(`Calendar export failed: ${error.message}`);
    }
  }

  /**
   * Import bookings from iCal URL
   * @param {String} villaId Villa ID
   * @param {String} icalUrl URL to iCal file
   * @param {String} source Source platform name
   * @returns {Object} Import result
   */
  async importFromICal(villaId, icalUrl, source = 'external') {
    const importResult = {
      success: false,
      imported: 0,
      updated: 0,
      skipped: 0,
      conflicts: [],
      errors: []
    };

    try {
      // Fetch iCal data
      const response = await axios.get(icalUrl, {
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024 // 10MB max
      });

      // Parse iCal data
      const parsedCal = icalParser.parseICS(response.data);

      // Process each event
      for (const key in parsedCal) {
        if (parsedCal[key].type === 'VEVENT') {
          const event = parsedCal[key];

          try {
            // Check for conflicts
            const conflict = await this.checkConflict(villaId, event.start, event.end);
            if (conflict) {
              importResult.conflicts.push({
                date: event.start,
                existingBooking: conflict.externalBookingId,
                newEvent: event.summary
              });
              importResult.skipped++;
              continue;
            }

            // Get villa to retrieve owner info
            const villa = await Villa.findById(villaId);

            // Transform iCal event to booking
            const bookingData = {
              villaId,
              ownerId: villa?.owner || null,
              externalBookingId: event.uid || `${source}_${uuidv4()}`,
              guestName: this.extractGuestName(event.summary) || 'iCal Guest',
              startDate: new Date(event.start),
              endDate: new Date(event.end),
              status: this.mapICalStatus(event.status),
              bookingSource: this.identifySource(event, source),
              syncedFrom: source,
              lastSyncTime: new Date(),
              autoSynced: true,
              notes: event.description || '',
              iCalUID: event.uid,
              totalFare: 0, // Default value for iCal imports
              currency: 'USD'
            };

            // Check if booking already exists
            const existingBooking = await Booking.findOne({
              $or: [
                { externalBookingId: bookingData.externalBookingId },
                { iCalUID: event.uid }
              ]
            });

            if (existingBooking) {
              // Update existing booking
              await Booking.findByIdAndUpdate(existingBooking._id, bookingData);
              importResult.updated++;
            } else {
              // Create new booking
              await Booking.create(bookingData);
              importResult.imported++;
            }
          } catch (eventError) {
            importResult.errors.push({
              event: event.summary,
              error: eventError.message
            });
          }
        }
      }

      importResult.success = true;
      return importResult;
    } catch (error) {
      console.error('Failed to import iCal:', error);
      importResult.errors.push({
        general: error.message
      });
      return importResult;
    }
  }

  /**
   * Sync calendars across all connected platforms
   * @param {String} villaId Villa ID
   * @param {String} userId Owner user ID
   * @returns {Object} Sync result
   */
  async syncAllPlatforms(villaId, userId) {
    const syncResults = {
      villa: villaId,
      timestamp: new Date(),
      platforms: [],
      totalSynced: 0,
      conflicts: [],
      errors: []
    };

    try {
      // Get all active platform integrations for user
      const integrations = await PlatformIntegration.find({
        userId,
        status: 'active'
      });

      // Get villa details
      const villa = await Villa.findById(villaId);
      if (!villa) {
        throw new Error('Villa not found');
      }

      // Sync with each platform
      for (const integration of integrations) {
        const platformResult = {
          platform: integration.platform,
          status: 'pending',
          synced: 0,
          errors: []
        };

        try {
          // Get service for platform
          const ServiceClass = this.getPlatformService(integration.platform);
          if (!ServiceClass) {
            platformResult.status = 'skipped';
            platformResult.errors.push('Service not available');
            continue;
          }

          const credentials = integration.getDecryptedCredentials();
          const service = new ServiceClass(credentials);

          // Fetch bookings from platform
          const bookingsResult = await service.fetchBookings(
            villa.platformListings?.[integration.platform]
          );

          if (bookingsResult.success) {
            // Process and save bookings
            for (const platformBooking of bookingsResult.bookings) {
              const transformedBooking = service.transformBooking(platformBooking);
              transformedBooking.villaId = villaId;
              transformedBooking.ownerId = userId;

              // Check for conflicts
              const conflict = await this.checkConflict(
                villaId,
                transformedBooking.startDate,
                transformedBooking.endDate,
                transformedBooking.externalBookingId
              );

              if (conflict) {
                syncResults.conflicts.push({
                  platform: integration.platform,
                  booking: transformedBooking.externalBookingId,
                  conflictWith: conflict.externalBookingId
                });
                continue;
              }

              // Save or update booking
              await Booking.findOneAndUpdate(
                { externalBookingId: transformedBooking.externalBookingId },
                transformedBooking,
                { upsert: true, new: true }
              );

              platformResult.synced++;
              syncResults.totalSynced++;
            }

            platformResult.status = 'success';
          } else {
            platformResult.status = 'failed';
            platformResult.errors.push(bookingsResult.error);
          }
        } catch (platformError) {
          platformResult.status = 'error';
          platformResult.errors.push(platformError.message);
          syncResults.errors.push({
            platform: integration.platform,
            error: platformError.message
          });
        }

        syncResults.platforms.push(platformResult);
      }

      // Update villa last sync time
      await Villa.findByIdAndUpdate(villaId, {
        lastCalendarSync: new Date()
      });

      // Create sync log
      await SyncLog.create({
        userId,
        villaId,
        syncType: 'calendar',
        status: syncResults.errors.length > 0 ? 'partial' : 'success',
        platformsSynced: syncResults.platforms.map(p => p.platform),
        totalBookingsSynced: syncResults.totalSynced,
        conflicts: syncResults.conflicts.length,
        errorCount: syncResults.errors.length,
        errorMessages: syncResults.errors,
        duration: Date.now() - syncResults.timestamp.getTime()
      });

      return syncResults;
    } catch (error) {
      console.error('Calendar sync failed:', error);
      syncResults.errors.push({
        general: error.message
      });
      return syncResults;
    }
  }

  /**
   * Check for booking conflicts
   * @param {String} villaId Villa ID
   * @param {Date} startDate Check-in date
   * @param {Date} endDate Check-out date
   * @param {String} excludeBookingId Booking ID to exclude from conflict check
   * @returns {Object|null} Conflicting booking or null
   */
  async checkConflict(villaId, startDate, endDate, excludeBookingId = null) {
    const query = {
      villaId,
      status: { $in: ['Confirmed', 'Active'] },
      $or: [
        // New booking starts during existing booking
        {
          startDate: { $lte: startDate },
          endDate: { $gt: startDate }
        },
        // New booking ends during existing booking
        {
          startDate: { $lt: endDate },
          endDate: { $gte: endDate }
        },
        // New booking completely contains existing booking
        {
          startDate: { $gte: startDate },
          endDate: { $lte: endDate }
        }
      ]
    };

    if (excludeBookingId) {
      query.externalBookingId = { $ne: excludeBookingId };
    }

    return await Booking.findOne(query);
  }

  /**
   * Update availability across all platforms
   * @param {String} villaId Villa ID
   * @param {Array} dates Array of dates to update
   * @param {Boolean} available Availability status
   * @returns {Object} Update result
   */
  async updatePlatformAvailability(villaId, dates, available = false) {
    const updateResults = {
      villa: villaId,
      dates: dates.length,
      platforms: [],
      success: false
    };

    try {
      const villa = await Villa.findById(villaId).populate('ownerId');
      if (!villa) {
        throw new Error('Villa not found');
      }

      // Get platform integrations
      const integrations = await PlatformIntegration.find({
        userId: villa.ownerId,
        status: 'active'
      });

      // Update each platform
      for (const integration of integrations) {
        const platformResult = {
          platform: integration.platform,
          status: 'pending'
        };

        try {
          const ServiceClass = this.getPlatformService(integration.platform);
          if (!ServiceClass) {
            platformResult.status = 'skipped';
            continue;
          }

          const credentials = integration.getDecryptedCredentials();
          const service = new ServiceClass(credentials);

          const listingId = villa.platformListings?.[integration.platform];
          if (listingId) {
            const result = await service.updateAvailability(listingId, dates, available);
            platformResult.status = result.success ? 'success' : 'failed';
            platformResult.message = result.message;
          } else {
            platformResult.status = 'no_listing';
          }
        } catch (error) {
          platformResult.status = 'error';
          platformResult.error = error.message;
        }

        updateResults.platforms.push(platformResult);
      }

      updateResults.success = updateResults.platforms.some(p => p.status === 'success');
      return updateResults;
    } catch (error) {
      console.error('Failed to update platform availability:', error);
      updateResults.error = error.message;
      return updateResults;
    }
  }

  /**
   * Get platform service class
   * @param {String} platform Platform name
   * @returns {Class|null} Service class or null
   */
  getPlatformService(platform) {
    const services = {
      airbnb: require('./integrations/AirbnbService'),
      booking_com: require('./integrations/BookingComService'),
      vrbo: require('./integrations/VRBOService'),
      expedia: require('./integrations/ExpediaService')
    };
    return services[platform] || null;
  }

  /**
   * Extract guest name from iCal summary
   * @param {String} summary Event summary
   * @returns {String} Guest name
   */
  extractGuestName(summary) {
    if (!summary) return null;

    // Common patterns in iCal summaries
    const patterns = [
      /^Reserved[:\s]+(.+)$/i,
      /^Booked[:\s]+(.+)$/i,
      /^Guest[:\s]+(.+)$/i,
      /^Reservation[:\s]+(.+)$/i,
      /^(.+)\s+\(Not available\)$/i,
      /^(.+)\s+\(Airbnb\)$/i,
      /^(.+)\s+\(Booking\.com\)$/i
    ];

    for (const pattern of patterns) {
      const match = summary.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // If no pattern matches, return the summary itself
    return summary;
  }

  /**
   * Identify source platform from iCal event
   * @param {Object} event iCal event object
   * @param {String} defaultSource Default source name
   * @returns {String} Source platform name
   */
  identifySource(event, defaultSource) {
    const summary = (event.summary || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const categories = event.categories || [];

    // Check for platform indicators
    if (summary.includes('airbnb') || description.includes('airbnb')) {
      return 'Airbnb';
    }
    if (summary.includes('booking.com') || description.includes('booking.com')) {
      return 'Booking.com';
    }
    if (summary.includes('vrbo') || description.includes('vrbo') ||
        summary.includes('homeaway') || description.includes('homeaway')) {
      return 'VRBO';
    }
    if (summary.includes('expedia') || description.includes('expedia')) {
      return 'Expedia';
    }

    // Check categories
    for (const category of categories) {
      const cat = category.toLowerCase();
      if (cat.includes('airbnb')) return 'Airbnb';
      if (cat.includes('booking')) return 'Booking.com';
      if (cat.includes('vrbo')) return 'VRBO';
      if (cat.includes('expedia')) return 'Expedia';
    }

    return defaultSource;
  }

  /**
   * Map iCal status to internal booking status
   * @param {String} icalStatus iCal event status
   * @returns {String} Internal booking status
   */
  mapICalStatus(icalStatus) {
    const statusMap = {
      'CONFIRMED': 'Confirmed',
      'TENTATIVE': 'Pending',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[icalStatus] || 'Confirmed';
  }

  /**
   * Generate iCal feed URL for villa
   * @param {String} villaId Villa ID
   * @returns {String} iCal feed URL
   */
  generateICalFeedUrl(villaId) {
    const baseUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:9000';
    const token = Buffer.from(`${villaId}:${Date.now()}`).toString('base64');
    return `${baseUrl}/api/calendar/ical/${villaId}?token=${token}`;
  }

  /**
   * Validate iCal URL
   * @param {String} url iCal URL
   * @returns {Boolean} Validation result
   */
  async validateICalUrl(url) {
    try {
      const response = await axios.head(url, {
        timeout: 10000
      });
      const contentType = response.headers['content-type'] || '';
      return contentType.includes('calendar') ||
             contentType.includes('text/calendar') ||
             url.endsWith('.ics') ||
             url.endsWith('.ical');
    } catch (error) {
      return false;
    }
  }
}

module.exports = CalendarSyncService;