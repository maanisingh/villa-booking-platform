# 🏖️ Villa Booking Platform

A comprehensive **full-stack MERN application** for managing villa bookings with multi-platform integration support (Airbnb, Booking.com, VRBO).

## ✨ Features

### For Owners
- 📝 Self-registration and profile management
- 🏡 Villa management (add, edit, delete properties)
- 📅 Calendar management with availability tracking
- 📊 Booking dashboard with real-time updates
- 🔄 Multi-platform integration (Airbnb, Booking.com, VRBO)
- 📧 Email configuration and notifications
- 💰 Revenue tracking and analytics

### For Admins
- 👥 Owner management (approve, edit, delete)
- 🏘️ Villa oversight and management
- 📈 System-wide analytics
- ⚙️ Platform integration management
- 📧 Email settings configuration
- 🔐 Role-based access control

## 🚀 Quick Start (Localhost - Zero Configuration)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd villa-booking-platform

# 2. Start everything with one command
./start.sh
```

That's it! The application will be running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:9000
- **API Health**: http://localhost:9000/api/health

### Stop the Application

```bash
./stop.sh
```

## 🔑 Default Credentials

### Admin
- Email: `admin@gmail.com`
- Password: `123`

### Owner
- Register new account at: http://localhost:5173/register

## 📋 Manual Setup (Optional)

If you prefer manual setup, see [MANUAL_SETUP.md](./MANUAL_SETUP.md)

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Auth**: JWT, bcrypt
- **Real-time**: Calendar sync, Email notifications

## 📚 API Documentation

See [API_DOCS.md](./API_DOCS.md) for complete API reference.

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:9000/api/health

# Test owner registration
curl -X POST http://localhost:9000/api/owners \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","phoneNumber":"1234567890"}'
```

## 🐛 Bug Fixes (November 15, 2025)

✅ **Fixed**: All 404 errors on registration and login
✅ **Fixed**: Frontend-backend connection issues
✅ **Fixed**: Centralized API configuration
✅ **Fixed**: Auto-detection of development vs production
✅ **Fixed**: Owner registration form field types

## 🚀 Deployment

For production deployment instructions, see [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

Quick deploy (5 minutes): [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

**Made with ❤️ for villa owners and property managers**
