#!/bin/bash

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "==========================================="
echo "Villa Booking Platform - API Endpoint Tests"
echo "==========================================="
echo ""

# Get authentication token
echo "1. Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:9000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Failed to get authentication token${NC}"
  echo "Response: $TOKEN_RESPONSE"
  exit 1
else
  echo -e "${GREEN}✓ Authentication successful${NC}"
fi

echo ""
echo "==========================================="
echo "Testing Platform Integration Endpoints"
echo "==========================================="

# Test 1: Platform Health
echo ""
echo "2. Testing GET /api/test/platform/health (No auth required)"
HEALTH=$(curl -s http://localhost:9000/api/test/platform/health)
if echo "$HEALTH" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Platform health endpoint working${NC}"
else
  echo -e "${RED}✗ Platform health endpoint failed${NC}"
  echo "Response: $HEALTH"
fi

# Test 2: Get all platforms
echo ""
echo "3. Testing GET /api/platforms (Requires auth)"
PLATFORMS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:9000/api/platforms)
echo "Response: $PLATFORMS"
if echo "$PLATFORMS" | grep -q '"success":true\|"platforms":\[\]'; then
  echo -e "${GREEN}✓ Get platforms endpoint working${NC}"
else
  echo -e "${RED}✗ Get platforms endpoint failed${NC}"
fi

# Test 3: Get email config
echo ""
echo "4. Testing GET /api/email/config (Requires auth)"
EMAIL_CONFIG=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:9000/api/email/config)
echo "Response: $EMAIL_CONFIG"
if echo "$EMAIL_CONFIG" | grep -q '"success"'; then
  echo -e "${GREEN}✓ Get email config endpoint working${NC}"
else
  echo -e "${RED}✗ Get email config endpoint failed${NC}"
fi

# Test 4: Airbnb Listings (Mock)
echo ""
echo "5. Testing GET /api/test/airbnb/listings (No auth required)"
AIRBNB=$(curl -s http://localhost:9000/api/test/airbnb/listings)
if echo "$AIRBNB" | grep -q '"mock":true'; then
  echo -e "${GREEN}✓ Airbnb mock endpoint working${NC}"
else
  echo -e "${RED}✗ Airbnb mock endpoint failed${NC}"
fi

# Test 5: Booking.com Properties (Mock)
echo ""
echo "6. Testing GET /api/test/booking-com/properties (No auth required)"
BOOKING_COM=$(curl -s http://localhost:9000/api/test/booking-com/properties)
if echo "$BOOKING_COM" | grep -q '"mock":true'; then
  echo -e "${GREEN}✓ Booking.com mock endpoint working${NC}"
else
  echo -e "${RED}✗ Booking.com mock endpoint failed${NC}"
fi

# Test 6: VRBO Listings (Mock)
echo ""
echo "7. Testing GET /api/test/vrbo/listings (No auth required)"
VRBO=$(curl -s http://localhost:9000/api/test/vrbo/listings)
if echo "$VRBO" | grep -q '"mock":true'; then
  echo -e "${GREEN}✓ VRBO mock endpoint working${NC}"
else
  echo -e "${RED}✗ VRBO mock endpoint failed${NC}"
fi

# Test 7: Calendar iCal (Mock)
echo ""
echo "8. Testing GET /api/test/calendar/ical (No auth required)"
ICAL=$(curl -s http://localhost:9000/api/test/calendar/ical)
if echo "$ICAL" | grep -q 'BEGIN:VCALENDAR'; then
  echo -e "${GREEN}✓ Calendar iCal endpoint working${NC}"
else
  echo -e "${RED}✗ Calendar iCal endpoint failed${NC}"
fi

echo ""
echo "==========================================="
echo "Test Summary"
echo "==========================================="
echo ""
echo "All platform integration endpoints have been tested."
echo "Check the results above for any failures."
