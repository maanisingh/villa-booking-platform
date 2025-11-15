# 🏝️ Villa Booking Platform

A comprehensive villa booking and property management platform with platform integration capabilities (Airbnb, Booking.com, VRBO), calendar synchronization, and multi-user role management.

## ✨ Features

### For Administrators
- 👥 Complete user & owner management
- 🏘️ Villa inventory management
- 📊 Dashboard with real-time statistics
- 📝 Booking overview across all properties
- ⚙️ System settings & configuration
- 🔗 Platform integration management

### For Villa Owners
- 🏠 Multi-villa property management
- 📅 Integrated calendar with sync capabilities
- 📧 Automated booking notifications
- 🔗 Platform integration (Airbnb, Booking.com, VRBO)
- 💼 Profile & property settings
- 📈 Booking analytics

### Platform Integrations
- 🏡 Airbnb integration
- 🛏️ Booking.com integration
- 🌴 VRBO integration
- 🔄 Automatic calendar synchronization
- 📤 Real-time booking updates
- 🔗 Webhook support

## 🚀 Quick Start (Ready in 2 Minutes!)

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Docker)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/villa-booking-platform.git
cd villa-booking-platform

# 2. Start MongoDB (if using Docker)
docker run -d -p 27018:27017 --name villa-mongodb mongo:latest

# 3. Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env if needed (defaults work for local development)
node seed-database.js  # Creates admin, owner, and sample villas
npm start

# 4. Frontend Setup (in new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# 5. Access the platform
# Frontend: http://localhost:5173
# Backend:  http://localhost:9000
```

## 🔐 Default Credentials (After Seeding)

### Admin Login
- **Email:** `admin@gmail.com`
- **Password:** `123`

### Owner Login
- **Email:** `testowner@villa.com`
- **Password:** `password123`

> **Note:** Change these credentials in production!

## 📁 Project Structure

```
villa-booking-platform/
├── backend/                 # Node.js/Express API
│   ├── Controller/          # Route controllers
│   ├── Models/              # Mongoose models
│   ├── Router/              # API routes
│   ├── Services/            # Business logic
│   ├── Middleware/          # Auth & validation
│   ├── Config/              # Configuration
│   ├── seed-database.js     # Database seeding script
│   └── Server.js            # Entry point
├── frontend/                # React/Vite frontend
│   ├── src/
│   │   ├── Auth/            # Login & registration
│   │   ├── Components/      # Admin & Owner dashboards
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main app component
│   └── dist/                # Production build
├── tests/                   # E2E tests
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
├── hoppscotch-collection.json  # API testing collection
└── README.md                # This file
```

## 🧪 Testing

### Quick API Test

```bash
# Health check
curl http://localhost:9000/api/health

# Admin login
curl -X POST http://localhost:9000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123"}'

# Get all villas
curl http://localhost:9000/api/villas
```

### Run All API Tests

```bash
chmod +x test-all-apis.sh
./test-all-apis.sh
```

### Playwright E2E Tests

```bash
# Install browsers (first time only)
npx playwright install

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui
```

### API Testing with Hoppscotch

1. Visit [hoppscotch.io](https://hoppscotch.io)
2. Import `hoppscotch-collection.json`
3. Test all endpoints interactively

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=9000
MONGO_URI=mongodb://localhost:27018/villaBooking
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:9000
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:9000/api
VITE_APP_NAME=Villa Booking Platform
```

## 📚 API Documentation

### Authentication

```bash
POST /api/admin/login
POST /api/owner/login
POST /api/owners  # Register new owner
```

### Villas

```bash
GET    /api/villas              # Get all villas
GET    /api/villas/:id          # Get single villa
GET    /api/villas/stats        # Get statistics
GET    /api/villas/my-villa/:ownerId  # Get owner's villas
POST   /api/villas              # Create villa (admin)
PUT    /api/villas/:id          # Update villa (admin)
PUT    /api/villas/my-villa/:id # Update own villa (owner)
DELETE /api/villas/:id          # Delete villa (admin)
```

### Bookings

```bash
GET  /api/bookings                   # Get all bookings (admin)
GET  /api/owner/bookings/:ownerId    # Get owner bookings
POST /api/bookings                   # Create booking
PUT  /api/bookings/:id               # Update booking
```

### Platform Integration

```bash
GET  /api/platform-connections/:ownerId  # Get connections
POST /api/platform-connections            # Create connection
PUT  /api/platform-connections/:id        # Update connection
```

### Owner Management

```bash
GET  /api/owners            # Get all owners (admin)
GET  /api/owner/profile     # Get current owner profile
PUT  /api/owner/profile     # Update own profile
POST /api/owners            # Create owner (register)
```

## 🌐 Deployment

### Deploy to Render.com

See detailed instructions in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Quick Steps:**
1. Push code to GitHub
2. Create Web Service on Render (Backend)
3. Create Static Site on Render (Frontend)
4. Set environment variables
5. Deploy!

### Deploy to Netlify + Railway

**Frontend (Netlify):**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

**Backend (Railway):**
- Connect GitHub repository
- Railway will auto-detect and deploy

## 🛡️ Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Input validation
- ✅ Secure MongoDB connections

## 🎯 Use Cases

- 🏨 Property management companies
- 🏡 Individual villa owners
- 🏠 Vacation rental businesses
- 🌴 Resort management
- 🏖️ Short-term rental platforms

## 🔄 Platform Sync Features

- **Airbnb:** Sync properties, bookings, and calendar
- **Booking.com:** Real-time availability updates
- **VRBO:** Automated listing management
- **Webhooks:** Instant booking notifications
- **iCal:** Calendar feed for external platforms

## 📊 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcrypt for password hashing

**Frontend:**
- React with Vite
- Bootstrap 5
- Axios for API calls
- React Router for navigation

**Testing:**
- Playwright for E2E tests
- Hoppscotch for API testing
- Jest (planned)

## 🚦 Development

### Start Development Servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Code Structure Best Practices

- Controllers handle HTTP requests/responses
- Services contain business logic
- Models define data schemas
- Middleware for auth & validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for scalability and ease of use
- Community-driven development

## 📞 Support

- 📧 Email: support@villaplatform.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/villa-booking-platform/issues)
- 📖 Docs: See `DEPLOYMENT_GUIDE.md`

---

⭐ **Star this repo if you find it helpful!**

Made with ❤️ for the villa booking community
