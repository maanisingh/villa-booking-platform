# Villa Booking Platform - Deployment Guide

## 🚀 Quick Start

This platform is production-ready with pre-configured admin and owner accounts for immediate use.

### Default Credentials

**Admin Account:**
- Email: `admin@gmail.com`
- Password: `123`

**Owner Account:**
- Email: `testowner@villa.com`
- Password: `password123`

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+ (or Docker with MongoDB image)
- Git

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd villa-booking-platform
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env file with your settings:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: Your secret key for JWT tokens
# - FRONTEND_URL: Your frontend URL (for CORS)
# - BACKEND_URL: Your backend URL (for webhooks)

# Seed the database (creates admin, owner, and sample villas)
node seed-database.js

# Start backend server
npm start
# OR for development:
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env file:
# VITE_API_URL=http://localhost:9000/api  # For development
# VITE_API_URL=https://your-api-domain.com/api  # For production

# Build for production
npm run build

# OR start development server
npm run dev
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# Seed the database
docker exec villa-booking-backend node seed-database.js

# View logs
docker-compose logs -f
```

## ☁️ Production Deployment Options

### Option 1: Render.com (Recommended)

**Backend:**
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && node Server.js`
5. Add environment variables from `.env.example`
6. Deploy!

**Frontend:**
1. Create a Static Site on Render
2. Set build command: `cd frontend && npm install && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Deploy!

**Database:**
- Use Render's managed MongoDB service
- OR use MongoDB Atlas (free tier available)

### Option 2: Netlify (Frontend) + Heroku/Railway (Backend)

**Frontend on Netlify:**
```bash
cd frontend
npm install
npm run build

# Deploy dist folder to Netlify
netlify deploy --prod --dir=dist
```

**Backend on Railway/Heroku:**
- Connect GitHub repository
- Set environment variables
- Deploy!

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# Install Node.js and MongoDB
# Clone repository
# Install dependencies
# Set up PM2 for process management

pm2 start backend/Server.js --name villa-backend
pm2 start frontend --name villa-frontend -- npm run dev

# Set up nginx as reverse proxy
# Configure SSL with Let's Encrypt
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Server
PORT=9000
NODE_ENV=production

# Database
MONGO_URI=mongodb://localhost:27017/villa_booking

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PASSWORD_SECRET=your-32-byte-encryption-key
ENCRYPTION_KEY=your-encryption-key

# URLs
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Platform Integration (Optional)
AIRBNB_CLIENT_ID=your-airbnb-client-id
AIRBNB_CLIENT_SECRET=your-airbnb-secret
BOOKING_API_KEY=your-booking-api-key
VRBO_API_KEY=your-vrbo-api-key
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=Villa Booking Platform
```

## 📊 Database Seeding

The platform comes with a seeding script that creates:
- 1 Admin user (`admin@gmail.com` / `123`)
- 1 Test owner (`testowner@villa.com` / `password123`)
- 5 Sample villas

To seed the database:

```bash
cd backend
node seed-database.js
```

This script is idempotent - it won't create duplicates if run multiple times.

## 🧪 Testing

### Backend API Tests

```bash
# Run API tests
chmod +x test-all-apis.sh
./test-all-apis.sh
```

### Frontend E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npx playwright test
```

### API Testing with Hoppscotch

Import `hoppscotch-collection.json` into Hoppscotch.io to test all API endpoints.

## 🔐 Security Checklist

- [ ] Change default admin credentials
- [ ] Update JWT_SECRET to a strong random value
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly for your frontend domain
- [ ] Set up MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Set up backup strategy for database

## 📱 Features

- ✅ Admin dashboard with villa & owner management
- ✅ Owner dashboard with multi-villa support
- ✅ Platform integration (Airbnb, Booking.com, VRBO)
- ✅ Calendar synchronization
- ✅ Booking management
- ✅ Email notifications (optional)
- ✅ Responsive design (mobile-friendly)

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection: `MONGO_URI` in `.env`
- Verify port 9000 is not in use: `lsof -i :9000`
- Check logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running

### Database connection failed
- Verify MongoDB is running
- Check MongoDB connection string
- Ensure network access is allowed (for cloud databases)

## 📞 Support

For issues and questions:
- Check the documentation
- Review environment variables
- Test with provided credentials first
- Check API endpoints with Hoppscotch collection

## 🎉 Post-Deployment

After successful deployment:

1. **Test Login:**
   - Login as admin
   - Login as owner
   - Register a new owner

2. **Test Core Features:**
   - View villas
   - Create a new villa
   - View bookings
   - Access platform integration settings

3. **Monitor:**
   - Check server logs
   - Monitor database connection
   - Test API response times

## 🔄 Updates

To update your deployment:

```bash
git pull origin main
cd backend && npm install
cd ../frontend && npm install && npm run build
# Restart services
```

---

Made with ❤️ for villa owners and property managers
