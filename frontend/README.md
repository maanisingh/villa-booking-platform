# Villa Booking Platform - Frontend

Modern React-based frontend for the Villa Booking Platform with role-based dashboards for Admins and Villa Owners.

## 🚀 Quick Start

### First-Time Setup

```bash
./setup.sh
```

**That's it!** One command does everything:
- ✅ Checks Node.js and npm installation
- ✅ Installs all dependencies automatically
- ✅ Creates `.env` file from template
- ✅ Checks backend connection
- ✅ **Offers to start the development server**

Just press **Enter** when prompted and you're running!

### Start Development Server (Subsequent Times)

```bash
./start-dev.sh
# OR
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📋 Prerequisites

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Backend running** on http://localhost:9000

## ⚙️ Configuration

### Environment Variables

Edit the `.env` file to configure your backend connection:

```env
# For local development
VITE_API_URL=http://localhost:9000/api

# For production deployment
# VITE_API_URL=https://your-backend-domain.com/api
```

## 🛠️ Manual Setup

If you prefer to set up manually:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit configuration (if needed)
nano .env

# 4. Start the development server
npm run dev
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup (auto-install and configure) |
| `npm run start:dev` | Quick start with backend connection check |
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🏗️ Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── Admin/       # Admin dashboard components
│   ├── Auth/        # Login & registration
│   ├── Owner/       # Owner dashboard components
│   ├── services/    # API services (axios)
│   └── App.jsx      # Main app component
├── setup.sh         # First-time setup script
├── start-dev.sh     # Quick development start
├── .env.example     # Environment template
└── package.json     # Dependencies and scripts
```

## 🎯 Features

### Admin Dashboard
- Villa management (CRUD operations)
- Owner management
- Booking oversight
- Analytics and reports
- Platform integration management

### Owner Dashboard
- My villas overview
- Booking management
- Revenue analytics
- Calendar synchronization
- Multi-platform publishing (Airbnb, Booking.com, VRBO)

## 🔧 Troubleshooting

### "Server not responding" Error

This means the frontend can't connect to the backend. Check:

```bash
# 1. Is backend running?
cd ../backend
pm2 list
# OR
curl http://localhost:9000/api/v1/villas

# 2. Start backend if not running
cd ../backend
./start-dev.sh

# 3. Check .env file
cat .env
# Should show: VITE_API_URL=http://localhost:9000/api
```

### Port Already in Use

```bash
# Find process using port 5173
sudo lsof -i :5173

# Kill the process
kill -9 <PID>

# OR change Vite port in vite.config.js
```

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Production Build

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

### Deployment

The frontend can be deployed to:
- **Netlify** (configured in `netlify.toml`)
- **Vercel**
- **Static hosting** (Nginx, Apache)
- **CDN** (CloudFlare, AWS CloudFront)

Update `.env.production` with your production backend URL:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 🔐 Default Credentials (for testing)

### Admin Login
- Email: `admin@gmail.com`
- Password: `123`

### Owner Login
- Email: `testowner@villa.com`
- Password: `password123`

## 📝 Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/maanisingh/villa-booking-platform.git
   cd villa-booking-platform/frontend
   ```

2. **Run setup and start**
   ```bash
   ./setup.sh
   # Press Enter when asked to start
   ```

3. **Start developing!**
   - The server is now running at http://localhost:5173
   - Make changes to files in `src/`
   - Vite will hot-reload automatically
   - No manual restart needed!

**Total setup time: < 2 minutes** ⚡

## 🔗 Backend Connection

The frontend automatically detects the environment:

- **Development** (`npm run dev`): Uses `http://localhost:9000/api`
- **Production** (`npm run build`): Uses `VITE_API_URL` from `.env.production`

Connection is handled in `src/services/api.js`.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly (both admin and owner dashboards)
4. Ensure backend is running during testing
5. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
- Check backend is running: `cd ../backend && pm2 list`
- Verify `.env` configuration
- Check browser console for errors
- Create an issue in the repository

---

**Happy coding! 🚀**
