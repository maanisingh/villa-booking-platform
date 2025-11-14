/**
 * Platform Integration Tester Router
 *
 * Provides mock/sandbox endpoints to test platform integration functionality
 * without requiring real API credentials
 */

const express = require("express");
const router = express.Router();

/**
 * Mock Airbnb API Response
 * Tests the platform integration system with simulated Airbnb data
 */
router.get("/test/airbnb/listings", (req, res) => {
  res.json({
    success: true,
    platform: "airbnb",
    data: {
      listings: [
        {
          id: "mock_airbnb_001",
          title: "Luxury Beach Villa - Seminyak",
          status: "active",
          bedrooms: 4,
          bathrooms: 3,
          maxGuests: 8,
          pricePerNight: 250,
          currency: "USD",
          location: {
            city: "Seminyak",
            country: "Indonesia"
          }
        },
        {
          id: "mock_airbnb_002",
          title: "Sunset View Villa - Canggu",
          status: "active",
          bedrooms: 3,
          bathrooms: 2,
          maxGuests: 6,
          pricePerNight: 180,
          currency: "USD",
          location: {
            city: "Canggu",
            country: "Indonesia"
          }
        }
      ],
      totalCount: 2,
      mock: true
    }
  });
});

/**
 * Mock Airbnb Bookings
 */
router.get("/test/airbnb/bookings", (req, res) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 7);

  res.json({
    success: true,
    platform: "airbnb",
    data: {
      bookings: [
        {
          id: "mock_booking_airbnb_001",
          listingId: "mock_airbnb_001",
          guestName: "John Smith",
          checkIn: today.toISOString().split('T')[0],
          checkOut: futureDate.toISOString().split('T')[0],
          guests: 4,
          totalPrice: 1750,
          status: "confirmed",
          platform: "Airbnb"
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

/**
 * Mock Booking.com API Response
 */
router.get("/test/booking-com/properties", (req, res) => {
  res.json({
    success: true,
    platform: "booking.com",
    data: {
      properties: [
        {
          hotelId: "mock_booking_001",
          name: "Ocean View Resort Villa",
          stars: 5,
          roomTypes: [
            {
              id: "room_001",
              name: "Deluxe Ocean Villa",
              maxOccupancy: 6,
              pricePerNight: 220
            }
          ],
          location: {
            address: "Jl. Beach Road 123",
            city: "Ubud",
            country: "Indonesia"
          }
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

/**
 * Mock Booking.com Reservations
 */
router.get("/test/booking-com/reservations", (req, res) => {
  const today = new Date();
  const checkoutDate = new Date(today);
  checkoutDate.setDate(today.getDate() + 5);

  res.json({
    success: true,
    platform: "booking.com",
    data: {
      reservations: [
        {
          reservationId: "mock_res_booking_001",
          hotelId: "mock_booking_001",
          guestName: "Jane Doe",
          checkIn: today.toISOString().split('T')[0],
          checkOut: checkoutDate.toISOString().split('T')[0],
          roomType: "Deluxe Ocean Villa",
          totalPrice: 1100,
          status: "confirmed",
          platform: "Booking.com"
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

/**
 * Mock VRBO API Response
 */
router.get("/test/vrbo/listings", (req, res) => {
  res.json({
    success: true,
    platform: "vrbo",
    data: {
      listings: [
        {
          propertyId: "mock_vrbo_001",
          headline: "Family Beach House with Pool",
          bedrooms: 5,
          bathrooms: 4,
          sleeps: 10,
          averageNightlyRate: 300,
          currency: "USD",
          location: {
            city: "Sanur",
            region: "Bali",
            country: "Indonesia"
          }
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

// Alias routes for compatibility
router.get("/test/booking/properties", (req, res) => {
  res.json({
    success: true,
    platform: "booking.com",
    data: {
      properties: [
        {
          hotelId: "mock_booking_001",
          name: "Ocean View Resort Villa",
          stars: 5,
          roomTypes: [
            {
              id: "room_001",
              name: "Deluxe Ocean Villa",
              maxOccupancy: 6,
              pricePerNight: 220
            }
          ],
          location: {
            address: "Jl. Beach Road 123",
            city: "Ubud",
            country: "Indonesia"
          }
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

router.get("/test/vrbo/rentals", (req, res) => {
  res.json({
    success: true,
    platform: "vrbo",
    data: {
      rentals: [
        {
          propertyId: "mock_vrbo_001",
          headline: "Family Beach House with Pool",
          bedrooms: 5,
          bathrooms: 4,
          sleeps: 10,
          averageNightlyRate: 300,
          currency: "USD",
          location: {
            city: "Sanur",
            region: "Bali",
            country: "Indonesia"
          }
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

/**
 * Mock VRBO Bookings
 */
router.get("/test/vrbo/bookings", (req, res) => {
  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + 3);
  const departureDate = new Date(arrivalDate);
  departureDate.setDate(arrivalDate.getDate() + 10);

  res.json({
    success: true,
    platform: "vrbo",
    data: {
      bookings: [
        {
          bookingId: "mock_vrbo_booking_001",
          propertyId: "mock_vrbo_001",
          guestName: "Bob Johnson",
          arrival: arrivalDate.toISOString().split('T')[0],
          departure: departureDate.toISOString().split('T')[0],
          numberOfGuests: 8,
          totalCost: 3000,
          status: "confirmed",
          platform: "VRBO"
        }
      ],
      totalCount: 1,
      mock: true
    }
  });
});

/**
 * Mock Calendar Sync Test
 */
router.get("/test/calendar/ical", (req, res) => {
  const icalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Villa Booking Platform//Calendar Test//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test Villa Calendar
X-WR-TIMEZONE:Asia/Jakarta

BEGIN:VEVENT
UID:test-event-001@villaplatform.com
DTSTART:20251120
DTEND:20251127
SUMMARY:Mock Booking - John Smith
DESCRIPTION:Test booking from Airbnb
LOCATION:Luxury Beach Villa - Seminyak
STATUS:CONFIRMED
END:VEVENT

BEGIN:VEVENT
UID:test-event-002@villaplatform.com
DTSTART:20251201
DTEND:20251205
SUMMARY:Mock Booking - Jane Doe
DESCRIPTION:Test booking from Booking.com
LOCATION:Ocean View Resort Villa - Ubud
STATUS:CONFIRMED
END:VEVENT

END:VCALENDAR`;

  res.setHeader("Content-Type", "text/calendar");
  res.send(icalData);
});

/**
 * Test Platform Integration Health
 */
router.get("/test/platform/health", (req, res) => {
  res.json({
    success: true,
    message: "Platform integration testing endpoints are operational",
    availableTests: {
      airbnb: {
        listings: "/api/test/airbnb/listings",
        bookings: "/api/test/airbnb/bookings"
      },
      bookingCom: {
        properties: "/api/test/booking-com/properties",
        reservations: "/api/test/booking-com/reservations"
      },
      vrbo: {
        listings: "/api/test/vrbo/listings",
        bookings: "/api/test/vrbo/bookings"
      },
      calendar: {
        ical: "/api/test/calendar/ical"
      },
      sync: {
        testAll: "/api/test/sync/all-platforms"
      }
    },
    note: "These are mock endpoints for testing. Real platform integration requires API credentials."
  });
});

/**
 * Test Full Sync Simulation
 */
router.post("/test/sync/all-platforms", (req, res) => {
  // Simulate a complete sync operation
  setTimeout(() => {
    res.json({
      success: true,
      message: "Mock sync completed successfully",
      results: {
        airbnb: {
          listingsSynced: 2,
          bookingsSynced: 1,
          status: "success"
        },
        bookingCom: {
          propertiesSynced: 1,
          reservationsSynced: 1,
          status: "success"
        },
        vrbo: {
          listingsSynced: 1,
          bookingsSynced: 1,
          status: "success"
        },
        totalProcessed: 6,
        errors: 0,
        duration: "1.2s",
        timestamp: new Date().toISOString(),
        mock: true
      }
    });
  }, 1200); // Simulate processing time
});

/**
 * Test Email Notification
 */
router.post("/test/email/send", (req, res) => {
  const { to, subject, type } = req.body;

  res.json({
    success: true,
    message: "Mock email sent successfully",
    details: {
      to: to || "test@example.com",
      subject: subject || "Test Email",
      type: type || "booking_confirmation",
      sentAt: new Date().toISOString(),
      mock: true,
      note: "This is a simulated email. Configure SMTP to send real emails."
    }
  });
});

/**
 * Test API Connection
 */
router.post("/test/connection/:platform", (req, res) => {
  const { platform } = req.params;
  const { credentials } = req.body;

  // Simulate connection test
  setTimeout(() => {
    res.json({
      success: true,
      platform,
      message: `Mock connection to ${platform} successful`,
      details: {
        authenticated: true,
        apiVersion: "v1.0",
        rateLimits: {
          remaining: 1000,
          reset: new Date(Date.now() + 3600000).toISOString()
        },
        mock: true,
        note: "This is a simulated connection. Real credentials required for actual integration."
      }
    });
  }, 500);
});

module.exports = router;
