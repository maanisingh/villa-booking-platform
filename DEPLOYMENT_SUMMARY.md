# Villa Booking Platform - Deployment Summary

## 🎉 Deployment Complete!

Your Villa Booking Platform has been successfully deployed and is now live at:
**https://villas.alexandratechlab.com**

---

## 📁 Project Structure

```
/root/villa-booking-platform/
├── frontend/           # React Frontend (Vite)
├── backend/            # Node.js/Express Backend
├── docker-compose.yml  # Docker orchestration
└── DEPLOYMENT_SUMMARY.md
```

---

## 🐳 Docker Services

### Running Containers:
1. **villa-booking-frontend**
   - Image: Custom built React app
   - Port: 3010 (internal) → 80 (container)
   - Status: ✅ Running

2. **villa-booking-backend**
   - Image: Custom built Node.js API
   - Port: 9000 (internal)
   - Status: ✅ Running
   - API Endpoints: http://localhost:9000/api/*

3. **villa-booking-mongodb**
   - Image: mongo:latest
   - Port: 27018 (external) → 27017 (container)
   - Database: loginSystem
   - Status: ✅ Healthy

---

## 🌐 Access Information

### Public URL:
- **Production**: https://villas.alexandratechlab.com
- **SSL Certificate**: Valid until February 11, 2026 (Let's Encrypt)

### Internal Ports:
- Frontend: http://localhost:3010
- Backend API: http://localhost:9000
- MongoDB: mongodb://localhost:27018

---

## 🔧 Technology Stack

### Frontend:
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.12
- **UI Library**: Bootstrap 5.3.8 + React Bootstrap
- **Routing**: React Router DOM 7.9.5
- **Icons**: Font Awesome, Bootstrap Icons, Lucide React
- **Charts**: React ChartJS 2, ECharts
- **HTTP Client**: Axios

### Backend:
- **Runtime**: Node.js 18
- **Framework**: Express 5.1.0
- **Database**: MongoDB via Mongoose 8.19.3
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.3
- **Middleware**: CORS, Cookie Parser, Multer (file uploads)

---

## 🔐 Security Features

- ✅ SSL/TLS encryption (HTTPS)
- ✅ JWT authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS configured
- ✅ Security headers enabled
- ✅ Cookie-based session management

---

## 📊 API Endpoints

### Authentication:
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Bookings:
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Villas:
- `GET /api/v1/villas` - Get all villas
- `POST /api/v1/villas` - Create new villa
- `PUT /api/v1/villas/:id` - Update villa
- `DELETE /api/v1/villas/:id` - Delete villa

### Dashboard:
- `GET /api/v1/dashboard` - Dashboard statistics

### Users:
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## 🚀 Management Commands

### Docker Management:
```bash
cd /root/villa-booking-platform

# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker logs villa-booking-frontend
docker logs villa-booking-backend
docker logs villa-booking-mongodb

# Restart services
docker compose restart

# Rebuild and restart
docker compose up -d --build
```

### Nginx Management:
```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### SSL Certificate:
```bash
# Renew certificate (auto-renewed, but manual command available)
sudo certbot renew

# Check certificate
sudo certbot certificates
```

---

## 📝 Environment Variables

### Backend (.env):
```env
PORT=9000
MONGO_URI=mongodb://mongodb:27017/loginSystem
JWT_SECRET=MySecretKey123
JWT_EXPIRES_IN=1d
PASSWORD_SECRET=your-32-byte-base64-or-random-key
NODE_ENV=production
```

### Frontend (.env.production):
```env
VITE_API_URL=/api
```

---

## 🔍 Monitoring

### Check Service Health:
```bash
# Check all containers
docker ps | grep villa-booking

# Check backend health
curl http://localhost:9000/api

# Check frontend
curl http://localhost:3010

# Check production site
curl https://villas.alexandratechlab.com
```

### View Logs:
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/villas.alexandratechlab.com.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/villas.alexandratechlab.com.error.log

# Docker container logs
docker logs -f villa-booking-backend
docker logs -f villa-booking-frontend
docker logs -f villa-booking-mongodb
```

---

## 🐛 Troubleshooting

### Container Issues:
```bash
# Restart specific container
docker restart villa-booking-backend

# Check container status
docker ps -a | grep villa-booking

# Inspect container
docker inspect villa-booking-backend

# Enter container shell
docker exec -it villa-booking-backend sh
```

### Database Issues:
```bash
# Connect to MongoDB
docker exec -it villa-booking-mongodb mongosh

# Check databases
docker exec -it villa-booking-mongodb mongosh --eval "show dbs"

# Check collections in loginSystem database
docker exec -it villa-booking-mongodb mongosh loginSystem --eval "show collections"
```

### Nginx Issues:
```bash
# Check nginx configuration
sudo nginx -t

# View nginx error log
sudo tail -50 /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

---

## 📦 Backup & Restore

### MongoDB Backup:
```bash
# Backup database
docker exec villa-booking-mongodb mongodump --out /data/backup

# Copy backup from container
docker cp villa-booking-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)
```

### MongoDB Restore:
```bash
# Copy backup to container
docker cp ./mongodb-backup villa-booking-mongodb:/data/restore

# Restore database
docker exec villa-booking-mongodb mongorestore /data/restore
```

---

## 🔄 Update & Deployment

### Update Frontend:
```bash
cd /root/villa-booking-platform/frontend
# Make your changes
docker compose build frontend
docker compose up -d frontend
```

### Update Backend:
```bash
cd /root/villa-booking-platform/backend
# Make your changes
docker compose build backend
docker compose up -d backend
```

### Full Rebuild:
```bash
cd /root/villa-booking-platform
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📈 Performance Optimization

### Nginx Caching:
- Static assets cached for 1 year
- API responses not cached (dynamic content)
- Gzip compression enabled

### Docker Resources:
```bash
# Check resource usage
docker stats villa-booking-frontend villa-booking-backend villa-booking-mongodb
```

---

## 🎯 Next Steps

1. **Configure Default Users**: Create admin/owner accounts in MongoDB
2. **Add Sample Data**: Populate database with sample villas and bookings
3. **Test All Features**: Login, booking creation, villa management
4. **Monitor Logs**: Check for any errors or issues
5. **Backup Strategy**: Set up automated database backups

---

## 📞 Support

### Useful Links:
- Frontend Repo: https://github.com/aman-sahu-31/Vill-Booking
- Backend Repo: https://github.com/aman-sahu-31/Bali-Reverie
- Production URL: https://villas.alexandratechlab.com

### Common Issues:
1. **Cannot access site**: Check DNS settings and nginx configuration
2. **API not working**: Check backend logs and MongoDB connection
3. **SSL errors**: Verify certificate with `sudo certbot certificates`

---

## ✅ Deployment Checklist

- [x] Clone repositories
- [x] Combine frontend and backend
- [x] Configure Docker containers
- [x] Set up MongoDB
- [x] Configure environment variables
- [x] Build Docker images
- [x] Start all services
- [x] Configure nginx reverse proxy
- [x] Obtain SSL certificate
- [x] Enable HTTPS
- [x] Test production deployment

---

**Deployment Date**: November 13, 2025
**Status**: ✅ Live and Running
**Domain**: https://villas.alexandratechlab.com
