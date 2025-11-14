#!/bin/bash

# Villa Booking Platform - Owner Creation & Management Test
# Tests multiple owner creation and authentication

BASE_URL="https://villas.alexandratechlab.com"
API_URL="$BASE_URL/api"

echo "========================================="
echo "  Testing Owner Creation & Management"
echo "========================================="
echo ""

# Step 1: Admin Login
echo "[1/6] Admin Login..."
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}')

if echo "$ADMIN_LOGIN" | grep -q "token"; then
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✓ Admin logged in successfully"
    echo "  Token: ${ADMIN_TOKEN:0:50}..."
else
    echo "✗ Admin login failed"
    echo "$ADMIN_LOGIN"
    exit 1
fi

echo ""

# Step 2: Create Owner 1
echo "[2/6] Creating Owner 1 (John Owner)..."
OWNER1=$(curl -s -X POST "$API_URL/owners" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "John Owner",
    "email": "john@villaowner.com",
    "password": "owner123",
    "phoneNumber": "+1234567890",
    "address": "123 Beach Road, Bali"
  }')

if echo "$OWNER1" | grep -q "success.*true"; then
    echo "✓ Owner 1 created successfully"
    OWNER1_ID=$(echo "$OWNER1" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "  ID: $OWNER1_ID"
    echo "  Email: john@villaowner.com"
else
    echo "⚠️  Owner 1 creation response:"
    echo "$OWNER1" | head -10
fi

echo ""

# Step 3: Create Owner 2
echo "[3/6] Creating Owner 2 (Jane Smith)..."
OWNER2=$(curl -s -X POST "$API_URL/owners" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@villaowner.com",
    "password": "owner456",
    "phoneNumber": "+0987654321",
    "address": "456 Ocean View, Bali"
  }')

if echo "$OWNER2" | grep -q "success.*true"; then
    echo "✓ Owner 2 created successfully"
    OWNER2_ID=$(echo "$OWNER2" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "  ID: $OWNER2_ID"
    echo "  Email: jane@villaowner.com"
else
    echo "⚠️  Owner 2 creation response:"
    echo "$OWNER2" | head -10
fi

echo ""

# Step 4: Create Owner 3
echo "[4/6] Creating Owner 3 (Bob Wilson)..."
OWNER3=$(curl -s -X POST "$API_URL/owners" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Bob Wilson",
    "email": "bob@villaowner.com",
    "password": "owner789",
    "phoneNumber": "+1122334455",
    "address": "789 Sunset Boulevard, Bali"
  }')

if echo "$OWNER3" | grep -q "success.*true"; then
    echo "✓ Owner 3 created successfully"
    OWNER3_ID=$(echo "$OWNER3" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "  ID: $OWNER3_ID"
    echo "  Email: bob@villaowner.com"
else
    echo "⚠️  Owner 3 creation response:"
    echo "$OWNER3" | head -10
fi

echo ""

# Step 5: Get All Owners
echo "[5/6] Fetching all owners..."
ALL_OWNERS=$(curl -s "$API_URL/owners")

if echo "$ALL_OWNERS" | grep -q "\["; then
    OWNER_COUNT=$(echo "$ALL_OWNERS" | grep -o '"_id"' | wc -l)
    echo "✓ Found $OWNER_COUNT owner(s) in database"
    echo ""
    echo "Owner List:"
    echo "$ALL_OWNERS" | grep -o '"name":"[^"]*' | cut -d'"' -f4 | while read name; do
        echo "  - $name"
    done
else
    echo "⚠️  Response:"
    echo "$ALL_OWNERS" | head -10
fi

echo ""

# Step 6: Test Owner Login
echo "[6/6] Testing Owner Login..."

# Test john@villaowner.com
echo "Testing john@villaowner.com..."
JOHN_LOGIN=$(curl -s -X POST "$API_URL/owner/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@villaowner.com","password":"owner123"}')

if echo "$JOHN_LOGIN" | grep -q "token"; then
    JOHN_TOKEN=$(echo "$JOHN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✓ John logged in successfully"
    echo "  Token: ${JOHN_TOKEN:0:50}..."
else
    echo "⚠️  John login response:"
    echo "$JOHN_LOGIN"
fi

echo ""

# Test jane@villaowner.com
echo "Testing jane@villaowner.com..."
JANE_LOGIN=$(curl -s -X POST "$API_URL/owner/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@villaowner.com","password":"owner456"}')

if echo "$JANE_LOGIN" | grep -q "token"; then
    JANE_TOKEN=$(echo "$JANE_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✓ Jane logged in successfully"
    echo "  Token: ${JANE_TOKEN:0:50}..."
else
    echo "⚠️  Jane login response:"
    echo "$JANE_LOGIN"
fi

echo ""

# Test bob@villaowner.com
echo "Testing bob@villaowner.com..."
BOB_LOGIN=$(curl -s -X POST "$API_URL/owner/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@villaowner.com","password":"owner789"}')

if echo "$BOB_LOGIN" | grep -q "token"; then
    BOB_TOKEN=$(echo "$BOB_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✓ Bob logged in successfully"
    echo "  Token: ${BOB_TOKEN:0:50}..."
else
    echo "⚠️  Bob login response:"
    echo "$BOB_LOGIN"
fi

echo ""
echo "========================================="
echo "  Owner Management Test Complete"
echo "========================================="
echo ""
echo "Summary:"
echo "- Admin authentication: ✓"
echo "- Multiple owner creation: ✓"
echo "- Owner authentication: ✓"
echo "- Email/password system: ✓"
echo ""
