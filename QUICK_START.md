# 🏝️ Villa Booking Platform - Quick Start Guide

## For New Developers (After Cloning from GitHub)

### Option 1: Automated Setup (Recommended) ⚡

```bash
# Navigate to backend
cd backend

# Run the setup script
./setup.sh

# Start the server
./start-dev.sh
```

### Option 2: Using npm Scripts

```bash
# Navigate to backend
cd backend

# Setup (first time only)
npm run setup

# Start development server
npm run start:dev
```

### Option 3: Manual Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit configuration (optional)
nano .env

# Start development server
npm run dev
```

## 🎯 What Each Script Does

### `setup.sh` - First-Time Setup
- ✅ Checks Node.js and npm
- ✅ Installs all dependencies
- ✅ Creates `.env` file
- ✅ Verifies MongoDB installation
- ⚠️ Run this **once** after cloning

### `start-dev.sh` - Quick Start
- ✅ Checks if `.env` exists (creates if missing)
- ✅ Checks if dependencies installed (installs if missing)
- ✅ Warns if MongoDB is not running
- ✅ Starts server with nodemon (auto-reload)
- 🔄 Run this **every time** you want to start development

### `post-pull.sh` - After Git Pull
- ✅ Updates dependencies if `package.json` changed
- ✅ Updates `.env` if `.env.example` changed
- ✅ Restarts PM2 process if running
- 🔄 Run this **after pulling** new code

## 📋 Prerequisites

Make sure you have:
- ✅ Node.js v14+ ([Download](https://nodejs.org/))
- ✅ MongoDB v4.4+ ([Install Guide](https://www.mongodb.com/docs/manual/installation/))
- ✅ Git

## 🚀 First-Time Developer Workflow

```bash
# 1. Clone the repository
git clone <repository-url>
cd villa-booking-platform

# 2. Setup backend
cd backend
./setup.sh

# 3. Configure environment (edit as needed)
nano .env

# 4. Ensure MongoDB is running
sudo systemctl start mongod

# 5. Start development
./start-dev.sh

# Server is now running at http://localhost:9000
```

## 🔄 Daily Development Workflow

```bash
# Pull latest changes
git pull origin main

# Update dependencies if needed (optional)
./post-pull.sh

# Start/restart server
./start-dev.sh

# Make your changes...
# (nodemon will auto-reload on file changes)
```

## 🛠️ Troubleshooting

### "MongoDB is not running"
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Auto-start on boot
```

### "Port 9000 already in use"
```bash
# Find and kill the process
sudo lsof -i :9000
kill -9 <PID>

# OR change port in .env
PORT=8000
```

### "Dependencies failed to install"
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Permission denied" when running scripts
```bash
# Make scripts executable
chmod +x setup.sh start-dev.sh post-pull.sh
```

## 📁 Project Structure

```
villa-booking-platform/
├── backend/
│   ├── Config/          # Configuration files
│   ├── Controller/      # Route controllers
│   ├── Middleware/      # Express middleware
│   ├── Models/          # MongoDB models
│   ├── Router/          # API routes
│   ├── Server.js        # Main entry point
│   ├── setup.sh         # ⭐ First-time setup
│   ├── start-dev.sh     # ⭐ Quick development start
│   ├── post-pull.sh     # ⭐ Post-pull updates
│   ├── .env.example     # Environment template
│   ├── .env             # Your configuration (git-ignored)
│   └── README.md        # Detailed documentation
└── QUICK_START.md       # This file
```

## 🔑 Important Files

- **`.env`** - Your local configuration (DO NOT commit to git)
- **`.env.example`** - Template for environment variables (safe to commit)
- **`package.json`** - Dependencies and npm scripts
- **`Server.js`** - Main application file

## 🌐 API Access

Once running, access the API at:
- **Local**: http://localhost:9000
- **Health Check**: http://localhost:9000/health (if implemented)
- **API Docs**: http://localhost:9000/api-docs (if implemented)

## 🔐 Default Configuration

The `.env.example` includes:
- MongoDB: `mongodb://localhost:27017/villa_booking`
- Port: `9000`
- JWT expiry: `7d`

Edit `.env` to customize for your environment.

## 💡 Tips

1. **Use `./start-dev.sh`** - It handles everything automatically
2. **Run `./post-pull.sh`** after pulling new code
3. **MongoDB must be running** before starting the server
4. **Nodemon auto-reloads** when you save files
5. **Check `.env.example`** for new variables after pulling

## 📚 More Information

For detailed API documentation, deployment guides, and advanced configuration, see:
- `backend/README.md` - Complete backend documentation
- Repository Wiki (if available)
- API documentation (if deployed)

## 🤝 Need Help?

- Check `backend/README.md` for detailed troubleshooting
- Create an issue in the repository
- Ask the team in Slack/Discord

---

**Happy coding! 🚀**
