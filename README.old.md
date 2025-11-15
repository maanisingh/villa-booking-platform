# 🏖️ Villa Booking Platform - Bali Reverie

A comprehensive property management system for villa bookings with multi-platform integration (Airbnb, Booking.com, VRBO, etc.)

## ✅ Status: Production Ready

All critical bugs have been fixed and the platform is fully functional.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd villa-booking-platform
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/villa_booking
PORT=9000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:9000
```

### Running Locally

**Development Mode:**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:5173
Backend API at: http://localhost:9000

**Production Mode with PM2:**

```bash
# Backend
cd backend
pm2 start Server.js --name villa-backend

# Frontend (build first)
cd ../frontend
npm run build
# Serve with nginx or any static file server
```

## 🔧 Recent Fixes (Nov 14, 2025)

All critical issues reported have been fixed:

✅ **Issue 1: Owner Registration (500 Error)** - FIXED
- Endpoint working correctly at `/api/owners`

✅ **Issue 2: Admin Dashboard Empty (500 Error)** - FIXED
- Removed invalid populate() for Owner model
- Stats endpoint returns data correctly

✅ **Issue 3: Add Owner 404 Error** - FIXED
- Route exists at correct path `/api/owners`

✅ **Issue 4: Owner ID Not Saved to localStorage** - FIXED
- Login.jsx now saves complete user object including ID
- Owner panel fully functional

✅ **Issue 5: admin_id ObjectId Casting Error** - FIXED
- Special handling for hardcoded admin_id
- No more MongoDB casting errors

✅ **Issue 6: Villa Integrations Dropdown Empty** - FIXED
- Corrected API path from `/api/villas` to `/api/v1/villas`

See `VILLA_PLATFORM_FIXES_COMPLETE.md` for detailed fix documentation.

## 🎯 Features

### For Administrators
- ✅ Villa management (CRUD operations)
- ✅ Owner management
- ✅ Dashboard with statistics
- ✅ Platform integration management
- ✅ Multi-villa platform publishing

### For Property Owners
- ✅ Manage their villas
- ✅ View bookings
- ✅ Platform integration settings
- ✅ Calendar synchronization
- ✅ Email notifications

### Platform Integrations
- Airbnb
- Booking.com
- VRBO/Expedia
- (More platforms can be added)

## 📁 Project Structure

```
villa-booking-platform/
├── backend/
│   ├── Config/          # Database configuration
│   ├── Controller/      # Business logic
│   ├── Middleware/      # Auth & validation
│   ├── Models/          # MongoDB schemas
│   ├── Router/          # API routes
│   ├── Services/        # Platform integrations
│   ├── Server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── Auth/        # Login & Registration
│   │   ├── Components/  # Admin & Owner dashboards
│   │   ├── Pages/       # Landing page
│   │   └── services/    # API calls
│   ├── public/
│   └── package.json
│
└── README.md
```

## 🔐 Default Credentials

**Admin:**
- Email: admin@gmail.com
- Password: 123

**Test Owner:**
- Register new owner through the registration page

## 📡 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/owner/login` - Owner login
- `POST /api/owners` - Create owner (registration)

### Villas
- `GET /api/v1/villas` - Get all villas
- `GET /api/v1/villas/stats` - Get villa statistics
- `GET /api/v1/villas/my-villa/:ownerId` - Get owner's villas
- `POST /api/v1/villas` - Create villa
- `PUT /api/v1/villas/:id` - Update villa
- `PUT /api/v1/villas/my-villa/:id` - Owner updates their villa
- `DELETE /api/v1/villas/:id` - Delete villa

### Owners
- `GET /api/owners` - Get all owners
- `GET /api/owner/profile` - Get owner profile
- `PUT /api/owner/profile` - Update owner profile
- `PUT /api/owner/change-password` - Change password
- `DELETE /api/owners/:id` - Delete owner

### Platform Integrations
- `GET /api/admin/villa-integrations` - Get all integrations
- `POST /api/admin/villa-integrations` - Create integration
- `DELETE /api/admin/villa-integrations/:id` - Remove integration

## 🧪 Testing

Run the verification test suite:
```bash
bash test_villa_fixes.sh
```

This will test:
- Owner registration
- Owner login with ID return
- Villa creation
- Owner villa retrieval
- Admin dashboard stats
- Platform integration endpoints

## 🚀 Deployment

### Using PM2 (Recommended for production)

```bash
# Backend
cd backend
pm2 start Server.js --name villa-backend
pm2 save
pm2 startup

# Frontend - Build and serve with nginx
cd ../frontend
npm run build
# Copy dist/ to your web server directory
```

### Using Docker (Optional)

```bash
# Backend
cd backend
docker build -t villa-backend .
docker run -p 9000:9000 villa-backend

# Frontend
cd ../frontend
docker build -t villa-frontend .
docker run -p 80:80 villa-frontend
```

## 🔄 Platform Sync

The platform includes automatic synchronization with external booking platforms:
- Quick sync: Every 15 minutes
- Full sync: Every 2 hours
- Calendar sync: Every hour
- Health check: Every 5 minutes

## 📝 Environment Variables Reference

### Backend .env
```
MONGO_URI=mongodb://localhost:27017/villa_booking
PORT=9000
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

### Frontend .env
```
VITE_API_URL=http://localhost:9000
```

## 🛠️ Troubleshooting

### Issue: "Cannot connect to MongoDB"
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check MONGO_URI in backend/.env

### Issue: "API calls failing"
- Verify backend is running on port 9000
- Check CORS configuration in backend/Server.js
- Ensure frontend .env has correct API URL

### Issue: "Owner ID undefined"
- Clear localStorage and login again
- Check browser console for errors
- Verify Login.jsx is saving user object

### Issue: "Villa stats returns 500"
- Check MongoDB connection
- Verify Villa model schema
- Check backend logs: `pm2 logs villa-backend`

## 📄 License

MIT License - feel free to use this project for your own villa booking platform!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for the villa rental industry**
