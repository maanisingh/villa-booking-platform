# Quick Test Commands - Platform Integration Endpoints

## Get Authentication Token
```bash
TOKEN=$(curl -s -X POST "http://localhost:9000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

## Test Platform Integration Endpoints (No Auth Required)

### Health Check
```bash
curl -s http://localhost:9000/api/test/platform/health | jq .
```

### Mock Airbnb Listings
```bash
curl -s http://localhost:9000/api/test/airbnb/listings | jq .
```

### Mock Airbnb Bookings
```bash
curl -s http://localhost:9000/api/test/airbnb/bookings | jq .
```

### Mock Booking.com Properties
```bash
curl -s http://localhost:9000/api/test/booking-com/properties | jq .
```

### Mock Booking.com Reservations
```bash
curl -s http://localhost:9000/api/test/booking-com/reservations | jq .
```

### Mock VRBO Listings
```bash
curl -s http://localhost:9000/api/test/vrbo/listings | jq .
```

### Mock VRBO Bookings
```bash
curl -s http://localhost:9000/api/test/vrbo/bookings | jq .
```

### Mock Calendar iCal
```bash
curl -s http://localhost:9000/api/test/calendar/ical
```

## Test Authenticated Endpoints

### Get User's Platform Integrations
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/api/platforms | jq .
```

### Get Email Configuration
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:9000/api/email/config | jq .
```

### Test Platform Connection
```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platform":"airbnb","apiKey":"test123","apiSecret":"secret456"}' \
  http://localhost:9000/api/platforms/test-connection | jq .
```

## Run Comprehensive Test Suite
```bash
cd /root/villa-booking-platform/backend
./test_all_endpoints.sh
```

## PM2 Management Commands

### View Backend Status
```bash
pm2 status villa-backend
```

### View Backend Logs
```bash
pm2 logs villa-backend
```

### Restart Backend
```bash
pm2 restart villa-backend
```

### Stop Backend
```bash
pm2 stop villa-backend
```

### Start Backend
```bash
pm2 start villa-backend
```

## Check Port Usage
```bash
# Check what's running on port 9000
lsof -i :9000

# Or using ss
ss -tlnp | grep 9000
```

## Docker Management (if using Docker)

### Check Running Containers
```bash
docker ps
```

### Stop Backend Container
```bash
docker stop villa-booking-backend
```

### Remove Backend Container
```bash
docker rm villa-booking-backend
```

## MongoDB Connection Test
```bash
# Connect to MongoDB
mongosh --port 27018

# In MongoDB shell:
use villa_booking_db
show collections
db.platformintegrations.find().pretty()
```

## Troubleshooting

### Routes Not Working?
1. Check if Docker container is conflicting:
   ```bash
   docker ps | grep villa-booking-backend
   ```

2. Check PM2 logs for errors:
   ```bash
   pm2 logs villa-backend --err --lines 50
   ```

3. Verify port 9000 is accessible:
   ```bash
   curl -I http://localhost:9000/api/test/platform/health
   ```

### Authentication Issues?
1. Verify admin login works:
   ```bash
   curl -X POST http://localhost:9000/api/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@gmail.com","password":"123"}'
   ```

2. Check token is valid:
   ```bash
   echo $TOKEN
   ```

## Quick Verification Script
```bash
#!/bin/bash
echo "Testing villa booking platform..."
echo ""
echo "1. Health check:"
curl -s http://localhost:9000/api/test/platform/health | jq -r '.message // "FAILED"'
echo ""
echo "2. Admin login:"
TOKEN=$(curl -s -X POST "http://localhost:9000/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  echo "✓ Authentication successful"
else
  echo "✗ Authentication failed"
fi
```
