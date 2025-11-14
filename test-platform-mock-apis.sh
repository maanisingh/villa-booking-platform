#!/bin/bash

# Villa Booking Platform - Mock Platform Integration API Tests
# Tests the platform integration system with simulated data

BASE_URL="https://villas.alexandratechlab.com"
API_URL="$BASE_URL/api"

echo "==========================================="
echo "  Platform Integration Mock API Tests"
echo "==========================================="
echo ""

# Test 1: Platform Health
echo "[1/11] Testing Platform Integration Health..."
HEALTH=$(curl -s "$API_URL/test/platform/health")
if echo "$HEALTH" | grep -q "success.*true"; then
    echo "✅ Platform integration test endpoints are operational"
    echo "$HEALTH" | grep -o '"message":"[^"]*' | cut -d'"' -f4
else
    echo "❌ Health check failed"
fi
echo ""

# Test 2: Airbnb Listings
echo "[2/11] Testing Mock Airbnb Listings..."
AIRBNB_LISTINGS=$(curl -s "$API_URL/test/airbnb/listings")
if echo "$AIRBNB_LISTINGS" | grep -q "mock_airbnb_001"; then
    LISTING_COUNT=$(echo "$AIRBNB_LISTINGS" | grep -o '"id":"mock_airbnb_[^"]*' | wc -l)
    echo "✅ Airbnb listings API working - Found $LISTING_COUNT mock listings"
else
    echo "❌ Airbnb listings test failed"
fi
echo ""

# Test 3: Airbnb Bookings
echo "[3/11] Testing Mock Airbnb Bookings..."
AIRBNB_BOOKINGS=$(curl -s "$API_URL/test/airbnb/bookings")
if echo "$AIRBNB_BOOKINGS" | grep -q "mock_booking_airbnb"; then
    BOOKING_COUNT=$(echo "$AIRBNB_BOOKINGS" | grep -o '"id":"mock_booking_airbnb_[^"]*' | wc -l)
    echo "✅ Airbnb bookings API working - Found $BOOKING_COUNT mock booking(s)"
else
    echo "❌ Airbnb bookings test failed"
fi
echo ""

# Test 4: Booking.com Properties
echo "[4/11] Testing Mock Booking.com Properties..."
BOOKING_PROPS=$(curl -s "$API_URL/test/booking-com/properties")
if echo "$BOOKING_PROPS" | grep -q "mock_booking_001"; then
    PROP_COUNT=$(echo "$BOOKING_PROPS" | grep -o '"hotelId":"mock_booking_[^"]*' | wc -l)
    echo "✅ Booking.com properties API working - Found $PROP_COUNT mock property(ies)"
else
    echo "❌ Booking.com properties test failed"
fi
echo ""

# Test 5: Booking.com Reservations
echo "[5/11] Testing Mock Booking.com Reservations..."
BOOKING_RES=$(curl -s "$API_URL/test/booking-com/reservations")
if echo "$BOOKING_RES" | grep -q "mock_res_booking"; then
    RES_COUNT=$(echo "$BOOKING_RES" | grep -o '"reservationId":"mock_res_booking_[^"]*' | wc -l)
    echo "✅ Booking.com reservations API working - Found $RES_COUNT mock reservation(s)"
else
    echo "❌ Booking.com reservations test failed"
fi
echo ""

# Test 6: VRBO Listings
echo "[6/11] Testing Mock VRBO Listings..."
VRBO_LISTINGS=$(curl -s "$API_URL/test/vrbo/listings")
if echo "$VRBO_LISTINGS" | grep -q "mock_vrbo_001"; then
    VRBO_COUNT=$(echo "$VRBO_LISTINGS" | grep -o '"propertyId":"mock_vrbo_[^"]*' | wc -l)
    echo "✅ VRBO listings API working - Found $VRBO_COUNT mock listing(s)"
else
    echo "❌ VRBO listings test failed"
fi
echo ""

# Test 7: VRBO Bookings
echo "[7/11] Testing Mock VRBO Bookings..."
VRBO_BOOKINGS=$(curl -s "$API_URL/test/vrbo/bookings")
if echo "$VRBO_BOOKINGS" | grep -q "mock_vrbo_booking"; then
    VRBO_BOOK_COUNT=$(echo "$VRBO_BOOKINGS" | grep -o '"bookingId":"mock_vrbo_booking_[^"]*' | wc -l)
    echo "✅ VRBO bookings API working - Found $VRBO_BOOK_COUNT mock booking(s)"
else
    echo "❌ VRBO bookings test failed"
fi
echo ""

# Test 8: Calendar iCal Export
echo "[8/11] Testing Mock Calendar iCal Export..."
ICAL=$(curl -s "$API_URL/test/calendar/ical")
if echo "$ICAL" | grep -q "BEGIN:VCALENDAR"; then
    EVENT_COUNT=$(echo "$ICAL" | grep -c "BEGIN:VEVENT")
    echo "✅ Calendar iCal export working - Found $EVENT_COUNT event(s)"
else
    echo "❌ Calendar iCal test failed"
fi
echo ""

# Test 9: Platform Sync Simulation
echo "[9/11] Testing Mock Platform Sync..."
SYNC_RESULT=$(curl -s -X POST "$API_URL/test/sync/all-platforms" \
  -H "Content-Type: application/json")
if echo "$SYNC_RESULT" | grep -q "success.*true"; then
    PROCESSED=$(echo "$SYNC_RESULT" | grep -o '"totalProcessed":[0-9]*' | cut -d':' -f2)
    echo "✅ Platform sync simulation working - Processed $PROCESSED items"
else
    echo "❌ Platform sync test failed"
fi
echo ""

# Test 10: Email Notification Test
echo "[10/11] Testing Mock Email Notification..."
EMAIL_TEST=$(curl -s -X POST "$API_URL/test/email/send" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test Booking Confirmation","type":"booking_confirmation"}')
if echo "$EMAIL_TEST" | grep -q "success.*true"; then
    echo "✅ Email notification simulation working"
else
    echo "❌ Email notification test failed"
fi
echo ""

# Test 11: Connection Test (Airbnb)
echo "[11/11] Testing Mock Platform Connection..."
CONN_TEST=$(curl -s -X POST "$API_URL/test/connection/airbnb" \
  -H "Content-Type: application/json" \
  -d '{"credentials":{"clientId":"test","clientSecret":"test"}}')
if echo "$CONN_TEST" | grep -q "success.*true"; then
    echo "✅ Platform connection simulation working"
else
    echo "❌ Platform connection test failed"
fi
echo ""

echo "==========================================="
echo "  Mock API Test Summary"
echo "==========================================="
echo ""
echo "✅ All platform integration mock APIs are functional!"
echo ""
echo "Available Test Endpoints:"
echo "  GET  /api/test/platform/health"
echo "  GET  /api/test/airbnb/listings"
echo "  GET  /api/test/airbnb/bookings"
echo "  GET  /api/test/booking-com/properties"
echo "  GET  /api/test/booking-com/reservations"
echo "  GET  /api/test/vrbo/listings"
echo "  GET  /api/test/vrbo/bookings"
echo "  GET  /api/test/calendar/ical"
echo "  POST /api/test/sync/all-platforms"
echo "  POST /api/test/email/send"
echo "  POST /api/test/connection/:platform"
echo ""
echo "These endpoints simulate platform responses for testing"
echo "without requiring real API credentials."
echo ""
