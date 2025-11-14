# API Connection Fix - Summary

## 🐛 Issues Fixed

### Problem:
The frontend was trying to connect to `http://localhost:9000/api` which doesn't work in production because:
1. The frontend is served via nginx
2. The backend is behind nginx reverse proxy
3. `localhost` in the browser refers to the user's machine, not the server

### Error Messages:
- "Failed to load owners" (Admin Dashboard)
- "Server not responding. Please check your backend connection." (Login)
- "Failed to load villa info" (Owner Dashboard)

---

## ✅ Solution Applied

### Changed ALL API calls from:
```javascript
http://localhost:9000/api/endpoint
```

### To:
```javascript
/api/endpoint
```

This allows nginx to properly proxy the requests to the backend container.

---

## 📝 Files Fixed

### 1. **Login Component** (`/src/Auth/Login.jsx`)
```javascript
// Before:
api: "http://localhost:9000/api/admin/login"

// After:
api: "/api/admin/login"
```

### 2. **Admin Dashboard** (`/src/Components/AdminDashboard/AdminOwners.jsx`)
```javascript
// Before:
const BASE_URL = "http://localhost:9000/api/owners";

// After:
const BASE_URL = "/api/owners";
```

### 3. **Owner Dashboard Files:**
- `OwnerCalender.jsx` - Calendar and booking endpoints
- `OwnerMyBooking.jsx` - Booking management
- `OwnerMyVillaInfo.jsx` - Villa information
- `OwnerProfile.jsx` - Profile management

### 4. **API Service** (`/src/services/api.js`)
```javascript
// Already configured with environment variable support:
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});
```

---

## 🔧 How It Works Now

### Request Flow:
```
Browser → https://villas.alexandratechlab.com/api/owners
         ↓
    Nginx (Port 443)
         ↓
    Proxy to Backend Container (Port 9000)
         ↓
    Express API responds
         ↓
    Response sent back to browser
```

### Nginx Configuration:
```nginx
location /api {
    proxy_pass http://localhost:9000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## ✅ Verification

### Test Admin Dashboard:
1. Login as admin (`admin@gmail.com` / `123`)
2. Navigate to "Owners" section
3. Should now see list of owners without errors

### Test Owner Dashboard:
1. Login as owner (`owner@gmail.com` / `123`)
2. Navigate to "My Villa Info"
3. Should now load villa information

### Test API Directly:
```bash
# Should return owner list:
curl https://villas.alexandratechlab.com/api/owners

# Should return success:
curl -X POST https://villas.alexandratechlab.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}'
```

---

## 🎯 Best Practices Applied

1. **Relative URLs**: Using `/api` instead of absolute URLs
2. **Environment Variables**: API service supports `VITE_API_URL` env var
3. **Proxy Configuration**: Nginx handles routing to backend
4. **CORS Properly Configured**: Backend accepts requests from production domain

---

## 📊 Impact

### Before Fix:
- ❌ Admin couldn't load owners list
- ❌ Owner couldn't load villa info
- ❌ Various API calls failing
- ❌ "Server not responding" errors

### After Fix:
- ✅ All API endpoints working
- ✅ Admin dashboard fully functional
- ✅ Owner dashboard fully functional
- ✅ No connection errors
- ✅ Proper request routing through nginx

---

## 🚀 Deployment

### Changes Applied:
1. Updated all frontend API calls
2. Rebuilt Docker frontend container
3. Restarted frontend service
4. Verified all endpoints working

### Commands Used:
```bash
cd /root/villa-booking-platform

# Fix all localhost URLs
find frontend/src -name "*.jsx" -o -name "*.js" | \
  xargs sed -i 's|http://localhost:9000/api|/api|g'

# Rebuild frontend
docker compose build frontend
docker compose up -d frontend
```

---

## 📝 Notes for Future Development

### When Adding New API Calls:

#### ✅ Correct:
```javascript
axios.get('/api/endpoint')
axios.post('/api/endpoint', data)
```

#### ❌ Incorrect:
```javascript
axios.get('http://localhost:9000/api/endpoint')
axios.post('http://localhost:5000/api/endpoint', data)
```

### Environment-Specific URLs:
If you need different URLs for development vs production:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
axios.get(`${API_BASE}/endpoint`);
```

Then in `.env.development`:
```env
VITE_API_URL=http://localhost:9000/api
```

And in `.env.production`:
```env
VITE_API_URL=/api
```

---

## 🔍 Debugging Tips

### If API calls fail:

1. **Check browser console** (F12)
   - Look for CORS errors
   - Check network tab for failed requests

2. **Check backend logs**
   ```bash
   docker logs villa-booking-backend
   ```

3. **Test API directly**
   ```bash
   curl https://villas.alexandratechlab.com/api/owners
   ```

4. **Check nginx logs**
   ```bash
   sudo tail -f /var/log/nginx/villas.alexandratechlab.com.access.log
   sudo tail -f /var/log/nginx/villas.alexandratechlab.com.error.log
   ```

5. **Verify containers are running**
   ```bash
   docker ps | grep villa-booking
   ```

---

**Fixed on**: November 13, 2025
**Status**: ✅ All API endpoints working correctly
**Tested**: Admin dashboard, Owner dashboard, Login system
