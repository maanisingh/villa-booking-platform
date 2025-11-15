# 🏝️ Villa Booking Platform - Installation

## One-Command Installation

```bash
./setup-all.sh
```

Press **Enter** twice, and you're done! ✅

---

## What Happens?

**Backend:**
1. Checks Node.js & npm ✓
2. Installs dependencies ✓
3. Creates .env file ✓
4. Checks MongoDB ✓

**Frontend:**
1. Installs dependencies ✓
2. Creates .env file ✓
3. Configures backend URL ✓

**Then:**
- Offers to start both servers automatically!

## Requirements

- Node.js v14+
- MongoDB v4.4+

## That's It!

- **Backend** runs at: **http://localhost:9000**
- **Frontend** runs at: **http://localhost:5173**

## Individual Setup

If you prefer to set up separately:

**Backend only:**
```bash
cd backend
./setup.sh
```

**Frontend only:**
```bash
cd frontend
./setup.sh
```

For more details, see [QUICK_START.md](QUICK_START.md)
