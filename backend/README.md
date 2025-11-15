# Villa Booking Platform - Backend API

A comprehensive villa booking management system with multi-platform integration support for Airbnb, Booking.com, and VRBO.

## 🚀 Quick Start

### First-Time Setup (After Cloning from GitHub)

```bash
./setup.sh
```

**That's it!** One command does everything:
- ✅ Checks Node.js and npm installation
- ✅ Installs all dependencies automatically
- ✅ Creates `.env` file from template
- ✅ Verifies MongoDB installation
- ✅ **Offers to start the server immediately**

Just press **Enter** when prompted and you're running!

### Start Development Server (Subsequent Times)

```bash
./start-dev.sh
# OR
npm run dev
```

The server will start on `http://localhost:9000`

## 📋 Prerequisites

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **MongoDB** v4.4 or higher ([Installation Guide](https://www.mongodb.com/docs/manual/installation/))
- **npm** (comes with Node.js)

## ⚙️ Configuration

### Environment Variables

Edit the `.env` file to configure your environment:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/villa_booking

# Server Configuration
PORT=9000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Platform API Keys (Optional)
AIRBNB_CLIENT_ID=your-airbnb-client-id
AIRBNB_CLIENT_SECRET=your-airbnb-secret
BOOKING_API_KEY=your-booking-com-api-key
VRBO_API_KEY=your-vrbo-api-key
```

## 🛠️ Manual Setup

If you prefer to set up manually:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit configuration
nano .env

# 4. Ensure MongoDB is running
sudo systemctl start mongod

# 5. Start the server
npm run dev
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup (auto-install and configure) |
| `npm run start:dev` | Quick start with auto-setup checks |
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run tests (not yet implemented) |

## 🏗️ Project Structure

```
backend/
├── Config/          # Configuration files
├── Controller/      # Route controllers
├── Middleware/      # Express middleware
├── Models/          # MongoDB models
├── Router/          # API routes
├── Server.js        # Main application file
├── setup.sh         # First-time setup script
├── start-dev.sh     # Quick development start script
├── .env.example     # Environment template
└── package.json     # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Villas
- `GET /api/v1/villas` - List all villas
- `POST /api/v1/villas` - Create new villa
- `GET /api/v1/villas/:id` - Get villa details
- `PUT /api/v1/villas/:id` - Update villa
- `DELETE /api/v1/villas/:id` - Delete villa

### Bookings
- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Platform Integration
- `GET /api/v1/platforms` - List connected platforms
- `POST /api/v1/platforms/connect` - Connect platform
- `POST /api/v1/platforms/sync` - Sync platform data

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod
```

### Port Already in Use
```bash
# Find process using port 9000
sudo lsof -i :9000

# Kill the process
kill -9 <PID>

# OR change PORT in .env file
```

### Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Production Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start Server.js --name villa-backend

# Save PM2 configuration
pm2 save

# Enable auto-start on boot
pm2 startup
```

### Environment Setup

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Set up proper SMTP credentials
5. Add platform API keys

## 📝 Development Workflow

1. **Clone the repository**
   ```bash
   git clone https://github.com/maanisingh/villa-booking-platform.git
   cd villa-booking-platform/backend
   ```

2. **Run setup and start**
   ```bash
   ./setup.sh
   # Press Enter when asked to start
   ```

3. **Start developing!**
   - The server is now running
   - Make changes to files
   - Nodemon will auto-reload on save
   - No manual restart needed!

**Total setup time: < 2 minutes** ⚡

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions, please create an issue in the repository.
