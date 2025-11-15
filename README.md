# 🏝️ Villa Booking Platform

A comprehensive villa booking management system with role-based dashboards for Admins and Villa Owners, featuring multi-platform integration (Airbnb, Booking.com, VRBO).

## ⚡ Quick Start

```bash
git clone https://github.com/maanisingh/villa-booking-platform.git
cd villa-booking-platform
./setup-all.sh
```

Press **Enter** when prompted → Both backend and frontend start automatically! 🚀

- **Backend:** http://localhost:9000
- **Frontend:** http://localhost:5173

## 📚 Documentation

- **[INSTALL.md](INSTALL.md)** - One-page installation guide
- **[QUICK_START.md](QUICK_START.md)** - Detailed quick start with troubleshooting
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend development guide

## 🎯 Features

### Admin Dashboard
- Villa CRUD operations
- Owner management
- Booking oversight
- Analytics and reporting
- Platform integration management

### Owner Dashboard
- My villas overview
- Booking management
- Revenue analytics
- Calendar synchronization
- Multi-platform publishing

### Platform Integrations
- **Airbnb** - Listing sync, booking management
- **Booking.com** - Real-time synchronization
- **VRBO** - Calendar and availability sync

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Node-cron (scheduled sync)

**Frontend:**
- React 19
- Vite
- React Router
- Axios
- Bootstrap + React Bootstrap
- Recharts (analytics)

## 📋 Prerequisites

- Node.js v14+ ([Download](https://nodejs.org/))
- MongoDB v4.4+ ([Install](https://www.mongodb.com/docs/manual/installation/))
- Git

## 🚀 Installation Options

### Option 1: Complete Setup (Recommended)

```bash
./setup-all.sh
```

Sets up both backend and frontend, offers to auto-start both servers.

### Option 2: Individual Setup

**Backend:**
```bash
cd backend
./setup.sh
```

**Frontend:**
```bash
cd frontend
./setup.sh
```

### Option 3: Manual Setup

See [QUICK_START.md](QUICK_START.md) for manual installation steps.

## 🔐 Default Credentials

### Admin Login
- Email: `admin@gmail.com`
- Password: `123`

### Owner Login
- Email: `testowner@villa.com`
- Password: `password123`

## 📁 Project Structure

```
villa-booking-platform/
├── backend/
│   ├── Config/
│   ├── Controller/
│   ├── Middleware/
│   ├── Models/
│   ├── Router/
│   ├── Server.js
│   ├── setup.sh          # Backend setup script
│   └── start-dev.sh      # Quick start script
├── frontend/
│   ├── src/
│   │   ├── Admin/        # Admin dashboard
│   │   ├── Auth/         # Authentication
│   │   ├── Owner/        # Owner dashboard
│   │   └── services/     # API services
│   ├── setup.sh          # Frontend setup script
│   └── start-dev.sh      # Quick start script
├── setup-all.sh          # Master setup script
├── INSTALL.md
├── QUICK_START.md
└── README.md (this file)
```

## 🔧 Development

### Start Backend
```bash
cd backend
npm run dev
# OR
./start-dev.sh
```

### Start Frontend
```bash
cd frontend
npm run dev
# OR
./start-dev.sh
```

### Build for Production
```bash
# Backend: Already production-ready
cd backend
npm start

# Frontend: Build static files
cd frontend
npm run build
```

## 🐛 Troubleshooting

### "Server not responding" Error
- **Cause:** Frontend can't connect to backend
- **Fix:** Ensure backend is running on http://localhost:9000
  ```bash
  cd backend && ./start-dev.sh
  ```

### Port Already in Use
```bash
# Backend (port 9000)
lsof -i :9000
kill -9 <PID>

# Frontend (port 5173)
lsof -i :5173
kill -9 <PID>
```

### MongoDB Not Running
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Auto-start on boot
```

See [QUICK_START.md](QUICK_START.md) for more troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
- Check [QUICK_START.md](QUICK_START.md) for detailed troubleshooting
- Verify backend is running: `cd backend && pm2 list`
- Check `.env` configuration in both frontend and backend
- Create an issue in the repository

## 🔗 Links

- **Repository:** https://github.com/maanisingh/villa-booking-platform
- **Backend API:** http://localhost:9000 (development)
- **Frontend:** http://localhost:5173 (development)

---

**Built with ❤️ using React, Node.js, and MongoDB**
