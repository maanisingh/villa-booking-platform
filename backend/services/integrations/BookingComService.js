/**
 * Booking.com Integration Service
 *
 * This service provides comprehensive integration with Booking.com Partner API
 * Implements booking sync, property publishing, and availability management
 *
 * Required Credentials:
 * - Partner ID
 * - API Key
 * - Hotel ID (for existing properties)
 */

const axios = require('axios');

class BookingComService {
  constructor(credentials) {
    this.partnerId = credentials.partnerId;
    this.apiKey = credentials.apiKey;
    this.hotelId = credentials.hotelId;
    this.baseURL = process.env.BOOKING_API_URL || "https://supply-xml.booking.com/hotels/xml";
    this.apiVersion = "2.8";

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Test connection to Booking.com API
   */
  async testConnection() {
    try {
      // TODO: Implement actual API call when credentials available
      // const response = await axios.post(`${this.baseURL}/test`, {
      //   headers: {
      //     'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`
      //   }
      // });

      // Mock response for now
      if (this.apiKey && this.partnerId) {
        return { success: true, message: "Connection successful (Mock)" };
      }

      return { success: false, message: "Missing credentials" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Publish listing to Booking.com
   */
  async publishListing(villaData) {
    try {
      // Transform villa data to Booking.com property format
      const property = {
        name: villaData.name,
        description: villaData.description,
        address: {
          street_address: villaData.location,
          city: "",
          postal_code: "",
          country_code: ""
        },
        facilities: villaData.amenities || [],
        property_type_id: 213, // Villa type ID in Booking.com
        room_count: parseInt(villaData.type) || 3,
        max_persons: 10,
        check_in_time: "15:00",
        check_out_time: "11:00",
        default_price: parseFloat(villaData.price) || 100,
        currency: "USD",
        photos: villaData.images || []
      };

      // TODO: Implement actual API call
      // const response = await axios.post(
      //   `${this.baseURL}/properties`,
      //   property,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // Mock response
      const mockPropertyId = `booking_${Date.now()}`;

      return {
        success: true,
        listingId: mockPropertyId,
        platform: "booking_com",
        url: `https://admin.booking.com/hotel/${mockPropertyId}`,
        message: "Property published successfully (Mock)"
      };
    } catch (error) {
      return {
        success: false,
        platform: "booking_com",
        error: error.message
      };
    }
  }

  /**
   * Update existing listing
   */
  async updateListing(listingId, villaData) {
    try {
      // TODO: Implement actual API call
      // const response = await axios.put(
      //   `${this.baseURL}/properties/${listingId}`,
      //   villaData,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`
      //     }
      //   }
      // );

      return {
        success: true,
        listingId,
        message: "Property updated successfully (Mock)"
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete listing from Booking.com
   */
  async deleteListing(listingId) {
    try {
      // TODO: Implement actual API call
      // await axios.delete(
      //   `${this.baseURL}/properties/${listingId}`,
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`
      //     }
      //   }
      // );

      return {
        success: true,
        message: "Property deleted successfully (Mock)"
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch reservations from Booking.com
   */
  async fetchBookings(villaId = null, startDate = null, endDate = null) {
    try {
      // TODO: Implement actual API call
      // const response = await axios.get(
      //   `${this.baseURL}/reservations`,
      //   {
      //     params: {
      //       hotel_id: this.hotelId,
      //       date_from: startDate,
      //       date_to: endDate
      //     },
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`
      //     }
      //   }
      // );

      // Mock response - return empty array or sample data
      const mockBookings = [];

      // Uncomment for testing with mock data:
      // mockBookings = [{
      //   reservation_id: 'booking_res_123',
      //   booker: {
      //     name: 'Jane Smith',
      //     email: 'jane@example.com'
      //   },
      //   checkin: new Date(),
      //   checkout: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      //   price: {
      //     total: 1500,
      //     currency: 'USD'
      //   },
      //   status: 'booked',
      //   hotel_id: this.hotelId
      // }];

      return {
        success: true,
        bookings: mockBookings,
        count: mockBookings.length
      };
    } catch (error) {
      return { success: false, error: error.message, bookings: [] };
    }
  }

  /**
   * Get availability calendar
   */
  async fetchCalendar(propertyId, startDate, endDate) {
    try {
      // TODO: Implement actual API call
      // const response = await axios.get(
      //   `${this.baseURL}/availability`,
      //   {
      //     params: {
      //       hotel_id: propertyId,
      //       start_date: startDate,
      //       end_date: endDate
      //     },
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`
      //     }
      //   }
      // );

      return {
        success: true,
        calendar: [],
        message: "Calendar fetched (Mock)"
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update availability
   */
  async updateAvailability(propertyId, dates, available = false) {
    try {
      // TODO: Implement actual API call
      // const response = await axios.post(
      //   `${this.baseURL}/availability`,
      //   {
      //     hotel_id: propertyId,
      //     dates: dates,
      //     available: available
      //   },
      //   {
      //     headers: {
      //       'Authorization': `Basic ${Buffer.from(`${this.partnerId}:${this.apiKey}`).toString('base64')}`
      //     }
      //   }
      // );

      return {
        success: true,
        message: "Availability updated (Mock)"
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Transform Booking.com reservation to internal format
   * Enhanced with all necessary fields for proper sync
   */
  transformBooking(bookingComReservation) {
    return {
      externalBookingId: `booking_${bookingComReservation.reservation_id}`,
      guestName: bookingComReservation.booker?.name ||
                 `${bookingComReservation.guest_first_name} ${bookingComReservation.guest_last_name}` ||
                 'Guest',
      guestEmail: bookingComReservation.booker?.email || bookingComReservation.guest_email,
      guestPhone: bookingComReservation.guest_phone,
      startDate: new Date(bookingComReservation.checkin),
      endDate: new Date(bookingComReservation.checkout),
      totalFare: bookingComReservation.price?.total || bookingComReservation.total_price || 0,
      commission: bookingComReservation.commission_amount || 0,
      currency: bookingComReservation.currency_code || 'USD',
      numberOfGuests: bookingComReservation.guest_count || 1,
      bookingSource: "Booking.com",
      status: this.mapStatus(bookingComReservation.status),
      syncedFrom: "booking_com",
      lastSyncTime: new Date(),
      autoSynced: true,
      paymentStatus: bookingComReservation.is_paid ? "paid" : "pending",
      specialRequests: bookingComReservation.remarks || "",
      bookingDate: new Date(bookingComReservation.booked_at || Date.now())
    };
  }

  /**
   * Map Booking.com status to internal status
   */
  mapStatus(bookingComStatus) {
    const statusMap = {
      'booked': 'Confirmed',
      'cancelled': 'Cancelled',
      'cancelled_by_hotel': 'Cancelled',
      'cancelled_by_guest': 'Cancelled',
      'no_show': 'Cancelled'
    };
    return statusMap[bookingComStatus] || 'Pending';
  }
}

module.exports = BookingComService;