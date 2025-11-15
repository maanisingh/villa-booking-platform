# ✅ After Setup - How to Use the Platform

## 🌐 Step 1: Open Your Web Browser

Go to:
```
http://localhost:5173
```

The Villa Booking Platform login page will open!

---

## 🔑 Step 2: Login

**✨ The database is already populated with test data!**

When you ran `./setup-all.sh`, it automatically created:
- ✅ 1 Admin user
- ✅ 1 Test Owner
- ✅ 5 Sample Villas (assigned to the test owner)

### Option A: Login as Admin

1. Select **"Admin"** role
2. **Email:** `admin@gmail.com`
3. **Password:** `123`
4. Click **Login**

You'll see the **Admin Dashboard** with:
- Villa management (5 sample villas already loaded!)
- Owner management (test owner already created!)
- Booking oversight
- Analytics
- Platform integrations

### Option B: Login as Villa Owner

1. Select **"Owner"** role
2. **Email:** `testowner@villa.com`
3. **Password:** `password123`
4. Click **Login**

You'll see the **Owner Dashboard** with:
- My Villas (5 villas already there!)
  - Sunset Beach Villa - $450/night
  - Mountain View Retreat - $320/night
  - Modern City Loft - $380/night
  - Tropical Garden Villa - $290/night
  - Luxury Cliff Villa - $650/night
- Bookings
- Calendar
- Revenue analytics
- Platform publishing

---

## 🚀 If Servers Are Not Running

### Check if running:
```bash
# Check backend
curl http://localhost:9000/api/v1/villas

# Check frontend
curl http://localhost:5173
```

### Start Backend:
```bash
cd backend
./start-dev.sh
# OR
npm run dev
```

### Start Frontend (in a new terminal):
```bash
cd frontend
./start-dev.sh
# OR
npm run dev
```

---

## 📍 URLs to Remember

| Service | URL |
|---------|-----|
| **Frontend (Main App)** | http://localhost:5173 |
| **Backend API** | http://localhost:9000 |
| **API Test** | http://localhost:9000/api/v1/villas |

---

## 🛑 How to Stop the Servers

### If running in terminals:
Press **Ctrl + C** in each terminal window

### If running in PM2:
```bash
pm2 stop villa-backend
pm2 stop villa-frontend
```

---

## 🔄 Daily Development Workflow

**Every day when you want to work:**

1. Open terminal
2. Go to project folder: `cd villa-booking-platform`
3. Start backend: `cd backend && npm run dev`
4. Open new terminal
5. Start frontend: `cd frontend && npm run dev`
6. Open browser: `http://localhost:5173`
7. Login and develop!

**OR use the quick scripts:**
```bash
# Terminal 1
cd villa-booking-platform/backend
./start-dev.sh

# Terminal 2
cd villa-booking-platform/frontend
./start-dev.sh
```

---

## 🎯 What You Can Do

### As Admin:
✅ Add/Edit/Delete Villas
✅ Manage Villa Owners
✅ View All Bookings
✅ See Platform Analytics
✅ Configure Platform Integrations

### As Owner:
✅ Add Your Villas
✅ Manage Your Properties
✅ View Your Bookings
✅ Track Revenue
✅ Publish to Airbnb/Booking.com/VRBO
✅ Sync Calendars

---

## 🆘 Troubleshooting

### "Server not responding" error:
```bash
# Make sure backend is running
cd backend
./start-dev.sh
```

### "Cannot GET /" error:
Your frontend isn't running. Start it:
```bash
cd frontend
npm run dev
```

### Port already in use:
```bash
# Kill the process
lsof -i :5173  # Frontend
lsof -i :9000  # Backend
kill -9 <PID>
```

---

## 📚 Next Steps

- Explore the Admin Dashboard
- Add test villas
- Try owner registration
- Check out the calendar sync
- Read the full docs in `QUICK_START.md`

---

**Enjoy building with Villa Booking Platform! 🏝️**
