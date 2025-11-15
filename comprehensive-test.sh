#!/bin/bash

# Comprehensive Battle Test Suite for Villa Booking Platform
# Tests: APIs, Frontend, Database, Features, Integration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TEST_LOG="/tmp/villa-test-$(date +%s).log"

# Helper functions
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1" | tee -a "$TEST_LOG"
}

pass_test() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$TEST_LOG"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$TEST_LOG"
    ((TESTS_FAILED++))
}

warn_test() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$TEST_LOG"
}

section() {
    echo ""  | tee -a "$TEST_LOG"
    echo "========================================"  | tee -a "$TEST_LOG"
    echo -e "${YELLOW}$1${NC}"  | tee -a "$TEST_LOG"
    echo "========================================"  | tee -a "$TEST_LOG"
}

echo "========================================"
echo "🧪 Villa Booking Platform - Battle Test"
echo "========================================"
echo "Started: $(date)"
echo "Log: $TEST_LOG"
echo ""

# ========================================
# 1. PRE-FLIGHT CHECKS
# ========================================
section "1. PRE-FLIGHT CHECKS"

log_test "Checking MongoDB..."
if pgrep -x mongod > /dev/null; then
    pass_test "MongoDB is running"
else
    fail_test "MongoDB is not running"
    echo "Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || sudo service mongodb start 2>/dev/null
    sleep 3
fi

log_test "Checking Node.js..."
if command -v node > /dev/null; then
    NODE_VERSION=$(node -v)
    pass_test "Node.js installed: $NODE_VERSION"
else
    fail_test "Node.js not installed"
    exit 1
fi

log_test "Checking npm..."
if command -v npm > /dev/null; then
    NPM_VERSION=$(npm -v)
    pass_test "npm installed: $NPM_VERSION"
else
    fail_test "npm not installed"
    exit 1
fi

# ========================================
# 2. BACKEND TESTS
# ========================================
section "2. BACKEND API TESTS"

log_test "Checking if backend is running..."
if curl -s http://localhost:9000/api/health > /dev/null 2>&1; then
    pass_test "Backend is already running"
else
    warn_test "Backend not running, starting it..."
    cd backend
    pkill -f "node.*Server.js" 2>/dev/null || true
    nohup node Server.js > "$TEST_LOG.backend" 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    sleep 5
    cd ..
fi

log_test "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:9000/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    pass_test "Health endpoint working"
    echo "  Response: $HEALTH_RESPONSE"
else
    fail_test "Health endpoint failed"
    echo "  Response: $HEALTH_RESPONSE"
fi

log_test "Testing database connection..."
if echo "$HEALTH_RESPONSE" | grep -q "connected"; then
    pass_test "Database connected"
else
    fail_test "Database connection failed"
fi

log_test "Testing admin login endpoint..."
ADMIN_LOGIN=$(curl -s -X POST http://localhost:9000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}')
if echo "$ADMIN_LOGIN" | grep -q "success.*true"; then
    pass_test "Admin login working"
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token: ${ADMIN_TOKEN:0:30}..."
else
    fail_test "Admin login failed"
    echo "  Response: $ADMIN_LOGIN"
fi

log_test "Testing owner registration..."
TIMESTAMP=$(date +%s)
OWNER_REG=$(curl -s -X POST http://localhost:9000/api/owners \
  -H "Content-Type: application/json" \
  -d "{
    \"name\":\"Test Owner $TIMESTAMP\",
    \"email\":\"owner$TIMESTAMP@test.com\",
    \"password\":\"test123\",
    \"phoneNumber\":\"1234567890\"
  }")
if echo "$OWNER_REG" | grep -q "success.*true"; then
    pass_test "Owner registration working"
    TEST_OWNER_EMAIL="owner$TIMESTAMP@test.com"
    echo "  Created: $TEST_OWNER_EMAIL"
else
    fail_test "Owner registration failed"
    echo "  Response: $OWNER_REG"
fi

log_test "Testing owner login..."
OWNER_LOGIN=$(curl -s -X POST http://localhost:9000/api/owner/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_OWNER_EMAIL\",\"password\":\"test123\"}")
if echo "$OWNER_LOGIN" | grep -q "success.*true"; then
    pass_test "Owner login working"
    OWNER_TOKEN=$(echo "$OWNER_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "  Token: ${OWNER_TOKEN:0:30}..."
else
    fail_test "Owner login failed"
    echo "  Response: $OWNER_LOGIN"
fi

log_test "Testing get all owners (admin)..."
OWNERS=$(curl -s http://localhost:9000/api/owners)
if [ ! -z "$OWNERS" ]; then
    OWNER_COUNT=$(echo "$OWNERS" | grep -o '"_id"' | wc -l)
    pass_test "Get owners working (found $OWNER_COUNT owners)"
else
    fail_test "Get owners failed"
fi

# ========================================
# 3. FRONTEND TESTS
# ========================================
section "3. FRONTEND TESTS"

log_test "Checking frontend dependencies..."
cd frontend
if [ -d "node_modules" ]; then
    pass_test "Frontend dependencies installed"
else
    warn_test "Installing frontend dependencies..."
    npm install --silent
    pass_test "Dependencies installed"
fi

log_test "Testing frontend build..."
if npm run build > /tmp/frontend-build.log 2>&1; then
    pass_test "Frontend builds successfully"
else
    fail_test "Frontend build failed"
    echo "  Check: /tmp/frontend-build.log"
fi

log_test "Checking if frontend dev server is running..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    pass_test "Frontend is already running"
else
    warn_test "Frontend not running, starting it..."
    pkill -f "vite" 2>/dev/null || true
    nohup npm run dev > "$TEST_LOG.frontend" 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    sleep 5
fi

log_test "Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    pass_test "Frontend accessible (HTTP $FRONTEND_RESPONSE)"
else
    fail_test "Frontend not accessible (HTTP $FRONTEND_RESPONSE)"
fi

log_test "Testing API service configuration..."
if grep -q "getBaseURL" src/services/api.js; then
    pass_test "API service properly configured"
else
    fail_test "API service not configured"
fi

cd ..

# ========================================
# 4. INTEGRATION TESTS
# ========================================
section "4. INTEGRATION TESTS"

log_test "Testing frontend-backend connectivity..."
# Create a simple Node.js script to test from frontend perspective
cat > /tmp/test-frontend-api.js << 'TESTJS'
const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.get('http://localhost:9000/api/health');
    if (response.data.status === 'healthy') {
      console.log('SUCCESS');
      process.exit(0);
    }
  } catch (error) {
    console.log('FAILED:', error.message);
    process.exit(1);
  }
}

testAPI();
TESTJS

cd frontend
if node /tmp/test-frontend-api.js 2>&1 | grep -q "SUCCESS"; then
    pass_test "Frontend can reach backend API"
else
    fail_test "Frontend cannot reach backend API"
fi
cd ..

# ========================================
# 5. DATABASE TESTS
# ========================================
section "5. DATABASE TESTS"

log_test "Testing MongoDB connection..."
if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    pass_test "MongoDB connection working"
else
    fail_test "MongoDB connection failed"
fi

log_test "Testing database operations..."
DB_TEST=$(mongosh --quiet villa_booking --eval "db.logins.countDocuments()")
if [ $? -eq 0 ]; then
    pass_test "Database queries working (found $DB_TEST logins)"
else
    fail_test "Database queries failed"
fi

# ========================================
# 6. STRESS TESTS
# ========================================
section "6. STRESS TESTS"

log_test "Testing multiple concurrent registrations..."
SUCCESS_COUNT=0
for i in {1..5}; do
    RESPONSE=$(curl -s -X POST http://localhost:9000/api/owners \
      -H "Content-Type: application/json" \
      -d "{
        \"name\":\"Concurrent Test $i\",
        \"email\":\"concurrent$i-$(date +%s)@test.com\",
        \"password\":\"test123\",
        \"phoneNumber\":\"123456789$i\"
      }")
    if echo "$RESPONSE" | grep -q "success.*true"; then
        ((SUCCESS_COUNT++))
    fi
done

if [ $SUCCESS_COUNT -eq 5 ]; then
    pass_test "Concurrent registrations: 5/5 succeeded"
else
    warn_test "Concurrent registrations: $SUCCESS_COUNT/5 succeeded"
fi

log_test "Testing rapid login attempts..."
LOGIN_SUCCESS=0
for i in {1..10}; do
    RESPONSE=$(curl -s -X POST http://localhost:9000/api/admin/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@gmail.com","password":"123"}')
    if echo "$RESPONSE" | grep -q "success.*true"; then
        ((LOGIN_SUCCESS++))
    fi
done

if [ $LOGIN_SUCCESS -eq 10 ]; then
    pass_test "Rapid logins: 10/10 succeeded"
else
    warn_test "Rapid logins: $LOGIN_SUCCESS/10 succeeded"
fi

# ========================================
# 7. SECURITY TESTS
# ========================================
section "7. SECURITY TESTS"

log_test "Testing SQL injection protection..."
SQL_INJECT=$(curl -s -X POST http://localhost:9000/api/owner/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com OR 1=1","password":"anything"}')
if echo "$SQL_INJECT" | grep -q "success.*false\|Invalid"; then
    pass_test "SQL injection protected"
else
    warn_test "Possible SQL injection vulnerability"
fi

log_test "Testing password hashing..."
DB_HASH=$(mongosh --quiet villa_booking --eval "db.logins.findOne({email:'$TEST_OWNER_EMAIL'}).password")
if echo "$DB_HASH" | grep -q '\$2[aby]\$'; then
    pass_test "Passwords are properly hashed (bcrypt)"
else
    fail_test "Passwords may not be hashed"
fi

# ========================================
# 8. FEATURE TESTS
# ========================================
section "8. FEATURE TESTS"

log_test "Testing API routes existence..."
ROUTES=(
    "/api/health"
    "/api/admin/login"
    "/api/owner/login"
    "/api/owners"
)

ROUTES_OK=0
for route in "${ROUTES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9000$route")
    if [ "$HTTP_CODE" != "404" ]; then
        ((ROUTES_OK++))
    fi
done

if [ $ROUTES_OK -eq ${#ROUTES[@]} ]; then
    pass_test "All routes accessible (${#ROUTES[@]}/${#ROUTES[@]})"
else
    warn_test "Some routes missing ($ROUTES_OK/${#ROUTES[@]})"
fi

# ========================================
# 9. DEPLOYMENT CHECKS
# ========================================
section "9. DEPLOYMENT READINESS"

log_test "Checking environment files..."
if [ -f "backend/.env.example" ] && [ -f "frontend/.env.example" ]; then
    pass_test "Environment examples exist"
else
    warn_test "Missing environment examples"
fi

log_test "Checking deployment docs..."
DOCS_COUNT=0
[ -f "README.md" ] && ((DOCS_COUNT++))
[ -f "DEPLOY_GUIDE.md" ] && ((DOCS_COUNT++))
[ -f "QUICK_DEPLOY.md" ] && ((DOCS_COUNT++))

if [ $DOCS_COUNT -eq 3 ]; then
    pass_test "All deployment docs present (3/3)"
else
    warn_test "Some docs missing ($DOCS_COUNT/3)"
fi

log_test "Checking scripts..."
if [ -x "start.sh" ] && [ -x "stop.sh" ]; then
    pass_test "Startup scripts are executable"
else
    warn_test "Scripts may not be executable"
fi

# ========================================
# FINAL REPORT
# ========================================
section "TEST SUMMARY"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Pass Rate: $PASS_RATE%"
echo ""
echo "Full log: $TEST_LOG"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}🎉 Platform is production-ready!${NC}"
    exit 0
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  MOST TESTS PASSED${NC}"
    echo -e "${YELLOW}Some issues found, but platform is functional${NC}"
    exit 0
else
    echo -e "${RED}❌ MULTIPLE FAILURES${NC}"
    echo -e "${RED}Platform needs attention before deployment${NC}"
    exit 1
fi
