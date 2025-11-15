# 🚀 Villa Booking Platform - Production Deployment

## Production URLs

- **Frontend**: https://villas.alexandratechlab.com
- **Backend API**: https://villas.alexandratechlab.com/api
- **Health Check**: https://villas.alexandratechlab.com/api/health

## Deployment Status ✅

**Date**: November 15, 2025
**Status**: Fully Operational

### Backend Deployment
- **Service**: PM2 Process Manager
- **Process Name**: `villa-backend`
- **Port**: 9000 (internal)
- **Database**: MongoDB on port 27018
- **Status**: ✅ Online

### Frontend Deployment
- **Server**: Nginx
- **Location**: `/var/www/villas/`
- **Build**: Production optimized
- **Status**: ✅ Deployed

### Infrastructure
- **Web Server**: Nginx 1.24.0
- **SSL**: Let's Encrypt
- **Proxy**: Nginx reverse proxy for `/api/*` → `localhost:9000`
- **Process Manager**: PM2

## Configuration

### Backend Environment (.env)
```bash
PORT=9000
MONGO_URI=mongodb://localhost:27018/villaBooking
JWT_SECRET=VillaBooking2024SecretKeyForPlatformIntegration123
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=https://villas.alexandratechlab.com
BACKEND_URL=http://localhost:9000
```

### Frontend Environment (.env.production)
```bash
VITE_API_URL=/api
VITE_APP_NAME=Villa Booking Platform
```

### Nginx Configuration
**Location**: `/etc/nginx/sites-available/villas.alexandratechlab.com`

Key features:
- SSL/TLS encryption via Let's Encrypt
- HTTP to HTTPS redirect
- API proxy to backend on port 9000
- Static file caching
- CORS headers configured
- Security headers enabled

## Default Credentials

### Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `123`
- **Access**: Full system administration

### Owner Account
- **Email**: `testowner@villa.com`
- **Password**: `password123`
- **Access**: Villa owner dashboard

## API Endpoints

All endpoints accessible at: `https://villas.alexandratechlab.com/api`

### Health & Status
- `GET /api/health` - Backend health check

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Villas
- `GET /api/v1/villas` - List all villas
- `POST /api/v1/villas` - Create villa (Admin only)
- `GET /api/v1/villas/:id` - Get villa details
- `PUT /api/v1/villas/:id` - Update villa
- `DELETE /api/v1/villas/:id` - Delete villa (Admin only)

### Dashboard
- `GET /api/v1/dashboard/admin` - Admin dashboard stats
- `GET /api/v1/dashboard/owner` - Owner dashboard stats

### Platform Integration
- `POST /api/platforms/connect` - Connect to platform
- `POST /api/publishing/publish` - Publish villa to platform
- `GET /api/calendar/sync/:villaId` - Sync calendar
- `POST /api/email/configure` - Configure email settings

## Features Deployed

### ✅ Admin Dashboard
- Villa CRUD operations
- Owner management
- Booking oversight
- Analytics and reporting
- Platform integration management
- Email configuration
- Calendar sync management

### ✅ Owner Dashboard
- My villas overview
- Booking management
- Revenue analytics
- Calendar synchronization
- Multi-platform publishing
- Villa details management

### ✅ Platform Integrations
- **Airbnb**: Listing sync, booking management
- **Booking.com**: Real-time synchronization
- **VRBO**: Calendar and availability sync
- Platform credentials management
- Automated sync scheduler (15min quick, 2hr full)

## Maintenance Commands

### Backend Management
```bash
# Check backend status
pm2 status villa-backend

# View logs
pm2 logs villa-backend

# Restart backend
pm2 restart villa-backend

# Stop backend
pm2 stop villa-backend

# Monitor backend
pm2 monit
```

### Frontend Deployment
```bash
# Navigate to frontend directory
cd /root/villa-booking-platform/frontend

# Build for production
NODE_ENV=production npm run build

# Deploy to production
cp -r dist/* /var/www/villas/
```

### Nginx Management
```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx
```

### Database Management
```bash
# Connect to MongoDB
docker exec -it villa-booking-mongodb mongosh

# Check database
docker ps | grep mongo

# View logs
docker logs villa-booking-mongodb
```

## Testing the Deployment

### 1. Test Frontend
```bash
curl -I https://villas.alexandratechlab.com
```
Expected: HTTP 200 OK

### 2. Test Backend Health
```bash
curl https://villas.alexandratechlab.com/api/health
```
Expected: `{"status":"healthy","database":"connected",...}`

### 3. Test API Endpoints
```bash
curl https://villas.alexandratechlab.com/api/v1/villas
```
Expected: JSON array of villas

### 4. Test Frontend in Browser
Open: https://villas.alexandratechlab.com
- Should load the login page
- Login with admin credentials
- Verify dashboard loads correctly

## Troubleshooting

### Backend Issues
```bash
# Check if backend is running
pm2 status villa-backend

# View recent logs
pm2 logs villa-backend --lines 50

# Restart backend
pm2 restart villa-backend
```

### Frontend Issues
```bash
# Check nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/villas.alexandratechlab.com.error.log

# Check if files are deployed
ls -la /var/www/villas/
```

### Database Issues
```bash
# Check MongoDB container
docker ps | grep mongo

# Restart MongoDB
docker restart villa-booking-mongodb

# View MongoDB logs
docker logs villa-booking-mongodb
```

### CORS Issues
If you see CORS errors in browser console:
1. Verify `FRONTEND_URL` in backend `.env` matches production domain
2. Restart backend: `pm2 restart villa-backend`
3. Check nginx CORS headers in config

## GitHub Repository

**Repository**: https://github.com/maanisingh/villa-booking-platform

### Clone and Setup
```bash
git clone https://github.com/maanisingh/villa-booking-platform.git
cd villa-booking-platform
./setup-all.sh
```

## Security Notes

⚠️ **Important Security Considerations**:

1. **Change Default Passwords**: The default credentials should be changed immediately after deployment
2. **Environment Variables**: Never commit `.env` files to GitHub
3. **JWT Secret**: Use a strong, unique JWT_SECRET in production
4. **Database**: Ensure MongoDB is not exposed to public internet
5. **SSL**: Keep SSL certificates updated (auto-renewed via certbot)

## Performance

- **Backend**: Node.js running on PM2 with auto-restart
- **Frontend**: Static files served by Nginx with caching
- **Database**: MongoDB with indexes for optimal query performance
- **Sync**: Background jobs run every 15 minutes (quick) and 2 hours (full)

## Monitoring

### Health Checks
- Backend health endpoint: `/api/health`
- Database connection: Verified in health check
- Process monitoring: PM2 dashboard

### Logs
- Backend logs: `pm2 logs villa-backend`
- Nginx access: `/var/log/nginx/villas.alexandratechlab.com.access.log`
- Nginx errors: `/var/log/nginx/villas.alexandratechlab.com.error.log`

## Support

For issues:
1. Check logs: `pm2 logs villa-backend`
2. Verify services: `pm2 status` and `systemctl status nginx`
3. Test connectivity: `curl https://villas.alexandratechlab.com/api/health`
4. Review documentation in repository

---

**Last Updated**: November 15, 2025
**Deployed By**: Claude Code
**Status**: ✅ Production Ready
