#!/bin/bash

# Villa Booking Platform - Comprehensive API Testing Script
# This script tests all major API endpoints to ensure they're working correctly

set -e

BASE_URL="http://localhost:9000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Villa Booking Platform - API Tests"
echo "======================================"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"

    echo -n "Testing: $test_name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status_code, expected $expected_status)"
        echo "Response: $body"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. HEALTH CHECK
echo "=== 1. Health & Status Endpoints ==="
test_api "Health Check" "GET" "/health" "" "200"
echo ""

# 2. AUTHENTICATION TESTS
echo "=== 2. Authentication Tests ==="
test_api "Admin Login" "POST" "/admin/login" \
    '{"email":"admin@gmail.com","password":"123"}' "200"

test_api "Owner Login" "POST" "/owner/login" \
    '{"email":"testowner@villa.com","password":"password123"}' "200"

test_api "Invalid Admin Login" "POST" "/admin/login" \
    '{"email":"admin@gmail.com","password":"wrong"}' "401"

echo ""

# Store tokens for authenticated requests
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@gmail.com","password":"123"}' | jq -r '.token')

OWNER_TOKEN=$(curl -s -X POST "$BASE_URL/owner/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"testowner@villa.com","password":"password123"}' | jq -r '.token')

OWNER_ID=$(curl -s -X POST "$BASE_URL/owner/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"testowner@villa.com","password":"password123"}' | jq -r '.user.id')

echo "Admin Token: ${ADMIN_TOKEN:0:20}..."
echo "Owner Token: ${OWNER_TOKEN:0:20}..."
echo "Owner ID: $OWNER_ID"
echo ""

# 3. OWNER REGISTRATION
echo "=== 3. Owner Registration ==="
TIMESTAMP=$(date +%s)
NEW_OWNER_EMAIL="newowner${TIMESTAMP}@test.com"

test_api "Create New Owner" "POST" "/owners" \
    "{\"name\":\"Test Owner\",\"email\":\"$NEW_OWNER_EMAIL\",\"password\":\"password123\",\"phoneNumber\":\"+1234567890\"}" \
    "201"

test_api "Duplicate Email Registration" "POST" "/owners" \
    "{\"name\":\"Test Owner\",\"email\":\"testowner@villa.com\",\"password\":\"password123\"}" \
    "400"

echo ""

# 4. VILLA ENDPOINTS
echo "=== 4. Villa Management ==="
test_api "Get All Villas" "GET" "/villas" "" "200"
test_api "Get Villa Stats" "GET" "/villas/stats" "" "200"
test_api "Get Owner's Villas" "GET" "/villas/my-villa/$OWNER_ID" "" "200"

echo ""

# 5. OWNER PROFILE
echo "=== 5. Owner Profile Tests ==="
# Test owner profile endpoint
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/owner/profile" \
    -H "Authorization: Bearer $OWNER_TOKEN")

PROFILE_STATUS=$(curl -s -w "%{http_code}" -o /dev/null -X GET "$BASE_URL/owner/profile" \
    -H "Authorization: Bearer $OWNER_TOKEN")

echo -n "Testing: Get Owner Profile... "
if [ "$PROFILE_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $PROFILE_STATUS)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $PROFILE_STATUS)"
    ((TESTS_FAILED++))
fi

echo ""

# 6. BOOKINGS
echo "=== 6. Booking Endpoints ==="
BOOKINGS_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/owner/bookings/$OWNER_ID")

echo -n "Testing: Get Owner Bookings... "
if [ "$BOOKINGS_STATUS" = "200" ] || [ "$BOOKINGS_STATUS" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $BOOKINGS_STATUS)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $BOOKINGS_STATUS)"
    ((TESTS_FAILED++))
fi

echo ""

# 7. PLATFORM INTEGRATION
echo "=== 7. Platform Integration ==="
PLATFORM_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/platform-connections/$OWNER_ID")

echo -n "Testing: Get Platform Connections... "
if [ "$PLATFORM_STATUS" = "200" ] || [ "$PLATFORM_STATUS" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $PLATFORM_STATUS)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $PLATFORM_STATUS)"
    ((TESTS_FAILED++))
fi

echo ""

# 8. CALENDAR SYNC
echo "=== 8. Calendar Sync Endpoints ==="
CALENDAR_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/calendar/sync/$OWNER_ID")

echo -n "Testing: Calendar Sync Status... "
if [ "$CALENDAR_STATUS" = "200" ] || [ "$CALENDAR_STATUS" = "404" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $CALENDAR_STATUS)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $CALENDAR_STATUS)"
    ((TESTS_FAILED++))
fi

echo ""

# 9. ADMIN ENDPOINTS
echo "=== 9. Admin Endpoints ==="
OWNERS_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/owners" \
    -H "Authorization: Bearer $ADMIN_TOKEN")

echo -n "Testing: Get All Owners (Admin)... "
if [ "$OWNERS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $OWNERS_STATUS)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $OWNERS_STATUS)"
    ((TESTS_FAILED++))
fi

echo ""

# SUMMARY
echo "======================================"
echo "TEST SUMMARY"
echo "======================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    exit 1
fi
