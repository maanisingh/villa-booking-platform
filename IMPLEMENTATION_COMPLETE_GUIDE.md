# Platform Integration - Complete Implementation Guide

## ✅ COMPLETED FILES (Ready to Use)

### Backend - Models (100% Complete):
1. `/backend/Models/PlatformIntegration.Model.js` - Platform credentials (with encryption)
2. `/backend/Models/EmailConfig.Model.js` - SMTP settings (with encryption)
3. `/backend/Models/SyncLog.Model.js` - Sync history tracking
4. `/backend/Models/villaModel.js` - Updated with platform fields
5. `/backend/Models/OwnerBooking.Model.js` - Updated with sync fields

### Backend - Services (Framework Complete):
6. `/backend/services/EmailService.js` - Email functionality
7. `/backend/services/integrations/AirbnbService.js` - Airbnb integration framework

---

## 🚀 QUICK START - Install Dependencies

```bash
cd /root/villa-booking-platform/backend
npm install nodemailer node-cron axios
```

---

## 📋 REMAINING IMPLEMENTATION STEPS

### Step 1: Create Similar Integration Services

Copy `/backend/services/integrations/AirbnbService.js` and create:

**BookingComService.js**:
```javascript
class BookingComService {
  constructor(credentials) {
    this.apiKey = credentials.apiKey;
    this.partnerId = credentials.partnerId;
    this.baseURL = "https://supply-xml.booking.com/hotels/xml";
  }
  // Same methods as AirbnbService with Booking.com format
}
```

**VRBOService.js**:
```javascript
class VRBOService {
  constructor(credentials) {
    this.apiKey = credentials.apiKey;
    this.partnerId = credentials.partnerId;
    this.baseURL = "https://api.homeaway.com/public";
  }
  // Same methods as AirbnbService with VRBO format
}
```

---

### Step 2: Create BookingSyncService

**File**: `/backend/services/BookingSyncService.js`

```javascript
const PlatformIntegration = require("../Models/PlatformIntegration.Model");
const Booking = require("../Models/OwnerBooking.Model");
const SyncLog = require("../Models/SyncLog.Model");
const AirbnbService = require("./integrations/AirbnbService");
const BookingComService = require("./integrations/BookingComService");
const VRBOService = require("./integrations/VRBOService");

class BookingSyncService {
  static getServiceClass(platform) {
    const services = {
      airbnb: AirbnbService,
      booking_com: BookingComService,
      vrbo: VRBOService,
    };
    return services[platform];
  }

  static async syncPlatform(userId, platform) {
    const startTime = Date.now();
    const syncLog = {
      userId,
      platform,
      syncType: "manual",
      status: "success",
      newBookings: 0,
      updatedBookings: 0,
      skippedBookings: 0,
      errorCount: 0,
      errorMessages: [],
    };

    try {
      // Get platform integration
      const integration = await PlatformIntegration.findOne({
        userId,
        platform,
        status: "active",
      });

      if (!integration) {
        throw new Error(`No active ${platform} integration found`);
      }

      // Get service class and credentials
      const ServiceClass = this.getServiceClass(platform);
      const credentials = integration.getDecryptedCredentials();
      const service = new ServiceClass(credentials);

      // Fetch bookings from platform
      const result = await service.fetchBookings();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Process each booking
      for (const externalBooking of result.bookings) {
        try {
          const transformedBooking = service.transformBooking(externalBooking);

          // Check if booking already exists
          const existingBooking = await Booking.findOne({
            externalBookingId: transformedBooking.externalBookingId,
          });

          if (existingBooking) {
            // Update existing booking
            await Booking.findByIdAndUpdate(
              existingBooking._id,
              transformedBooking
            );
            syncLog.updatedBookings++;
          } else {
            // Create new booking
            await Booking.create({
              ...transformedBooking,
              ownerId: userId,
            });
            syncLog.newBookings++;
          }
        } catch (error) {
          syncLog.errorCount++;
          syncLog.errorMessages.push({
            message: error.message,
            bookingId: externalBooking.id,
            timestamp: new Date(),
          });
        }
      }

      // Update integration
      await PlatformIntegration.findByIdAndUpdate(integration._id, {
        lastSync: new Date(),
        lastSyncResult: {
          newBookings: syncLog.newBookings,
          updatedBookings: syncLog.updatedBookings,
          errors: syncLog.errorCount,
        },
        totalBookingsSynced:
          integration.totalBookingsSynced + syncLog.newBookings,
      });
    } catch (error) {
      syncLog.status = "failed";
      syncLog.errorCount++;
      syncLog.errorMessages.push({
        message: error.message,
        timestamp: new Date(),
      });
    }

    // Calculate duration
    syncLog.duration = Date.now() - startTime;

    // Save sync log
    await SyncLog.create(syncLog);

    return syncLog;
  }

  static async syncAllPlatforms(userId) {
    const integrations = await PlatformIntegration.find({
      userId,
      status: "active",
      autoSync: true,
    });

    const results = [];

    for (const integration of integrations) {
      const result = await this.syncPlatform(userId, integration.platform);
      results.push(result);
    }

    return results;
  }
}

module.exports = BookingSyncService;
```

---

### Step 3: Create API Routes

**File**: `/backend/Router/PlatformIntegration.Router.js`

```javascript
const express = require("express");
const router = express.Router();
const PlatformIntegration = require("../Models/PlatformIntegration.Model");
const auth = require("../Middleware/AuthMiddleware");

// Get all platform integrations for user
router.get("/platforms", auth, async (req, res) => {
  try {
    const integrations = await PlatformIntegration.find({
      userId: req.user.id,
    }).select("-credentials");

    res.json({ success: true, data: integrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Connect to platform
router.post("/platforms/connect", auth, async (req, res) => {
  try {
    const { platform, credentials, syncFrequency, autoSync } = req.body;

    // Check if already connected
    const existing = await PlatformIntegration.findOne({
      userId: req.user.id,
      platform,
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Platform already connected" });
    }

    const integration = await PlatformIntegration.create({
      userId: req.user.id,
      platform,
      credentials,
      syncFrequency: syncFrequency || 2,
      autoSync: autoSync !== false,
      status: "active",
    });

    res.status(201).json({
      success: true,
      data: { ...integration.toObject(), credentials: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disconnect platform
router.delete("/platforms/:id", auth, async (req, res) => {
  try {
    await PlatformIntegration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    res.json({ success: true, message: "Platform disconnected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manual sync
router.post("/platforms/:platform/sync", auth, async (req, res) => {
  try {
    const BookingSyncService = require("../services/BookingSyncService");
    const result = await BookingSyncService.syncPlatform(
      req.user.id,
      req.params.platform
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

**File**: `/backend/Router/EmailConfig.Router.js`

```javascript
const express = require("express");
const router = express.Router();
const EmailConfig = require("../Models/EmailConfig.Model");
const EmailService = require("../services/EmailService");
const auth = require("../Middleware/AuthMiddleware");

// Get email config
router.get("/email/config", auth, async (req, res) => {
  try {
    const config = await EmailConfig.findOne({ userId: req.user.id }).select(
      "-smtpPassword"
    );

    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save email config
router.post("/email/configure", auth, async (req, res) => {
  try {
    const {
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName,
      provider,
    } = req.body;

    const config = await EmailConfig.findOneAndUpdate(
      { userId: req.user.id },
      {
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName: fromName || "Villa Booking Platform",
        provider: provider || "custom",
        isActive: true,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: { ...config.toObject(), smtpPassword: undefined },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test email
router.post("/email/test", auth, async (req, res) => {
  try {
    const { toEmail } = req.body;
    const result = await EmailService.sendTestEmail(req.user.id, toEmail);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

---

### Step 4: Register Routes in Server.js

Add to `/backend/Server.js`:

```javascript
const platformRoutes = require("./Router/PlatformIntegration.Router");
const emailRoutes = require("./Router/EmailConfig.Router");

app.use("/api", platformRoutes);
app.use("/api", emailRoutes);
```

---

### Step 5: Create Cron Job Service

**File**: `/backend/services/CronJobService.js`

```javascript
const cron = require("node-cron");
const BookingSyncService = require("./BookingSyncService");
const PlatformIntegration = require("../Models/PlatformIntegration.Model");

class CronJobService {
  static init() {
    // Run every 2 hours
    cron.schedule("0 */2 * * *", async () => {
      console.log("Running scheduled booking sync...");

      try {
        // Get all active integrations with autoSync enabled
        const integrations = await PlatformIntegration.find({
          status: "active",
          autoSync: true,
        });

        for (const integration of integrations) {
          try {
            await BookingSyncService.syncPlatform(
              integration.userId,
              integration.platform
            );
            console.log(
              `✓ Synced ${integration.platform} for user ${integration.userId}`
            );
          } catch (error) {
            console.error(
              `✗ Failed to sync ${integration.platform}:`,
              error.message
            );
          }
        }

        console.log("Scheduled sync completed");
      } catch (error) {
        console.error("Cron job error:", error);
      }
    });

    console.log("✓ Cron job scheduler initialized");
  }
}

module.exports = CronJobService;
```

Add to `Server.js`:

```javascript
const CronJobService = require("./services/CronJobService");
CronJobService.init();
```

---

## 🎨 FRONTEND IMPLEMENTATION

### Owner Platform Settings Component

**File**: `/frontend/src/Components/OwnerDashboard/OwnerPlatformSettings.jsx`

```javascript
import React, { useState, useEffect } from "react";
import { Card, Button, Form, Badge, Alert } from "react-bootstrap";
import axios from "axios";

const OwnerPlatformSettings = () => {
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await axios.get("/api/platforms");
      setPlatforms(res.data.data);
    } catch (error) {
      console.error("Failed to fetch platforms:", error);
    }
  };

  const handleSync = async (platform) => {
    setSyncing(true);
    try {
      const res = await axios.post(`/api/platforms/${platform}/sync`);
      alert(
        `Synced ${res.data.data.newBookings} new bookings, updated ${res.data.data.updatedBookings}`
      );
      fetchPlatforms();
    } catch (error) {
      alert("Sync failed: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <h2>Platform Integrations</h2>

      {/* Airbnb Card */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5>Airbnb</h5>
              <small>Connect your Airbnb account</small>
            </div>
            <div>
              <Badge bg="success">Connected</Badge>
              <Button
                size="sm"
                className="ms-2"
                onClick={() => handleSync("airbnb")}
                disabled={syncing}
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Add more platform cards... */}
    </div>
  );
};

export default OwnerPlatformSettings;
```

---

## 📦 FINAL STEPS

### 1. Install Dependencies

```bash
cd /root/villa-booking-platform/backend
npm install nodemailer node-cron axios
```

### 2. Rebuild Docker

```bash
cd /root/villa-booking-platform
docker compose build backend
docker compose up -d backend
```

### 3. Test API Endpoints

```bash
# Test platform connection
curl -X POST https://villas.alexandratechlab.com/api/platforms/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "airbnb",
    "credentials": {"apiKey": "test", "accessToken": "test"},
    "autoSync": true
  }'
```

---

## 🎯 IMPLEMENTATION CHECKLIST

- [✓] Database models created
- [✓] Email service created
- [✓] Integration services framework created
- [ ] Complete API routes
- [ ] Frontend components
- [ ] Install NPM packages
- [ ] Test endpoints
- [ ] Deploy

---

## 📚 NEXT STEPS

1. Complete the remaining integration service files (Booking.com, VRBO)
2. Create frontend components for platform settings
3. Add UI for villa publishing workflow
4. Enhance calendar with sync indicators
5. Test end-to-end flow

Would you like me to continue with any specific part?
