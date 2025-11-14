const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// IMPORTANT: Load environment variables FIRST before importing any routes or services
dotenv.config();

// Import routes AFTER dotenv.config() so environment variables are available
const loginRoutes = require("./Router/Login.Router");
const bookingRoutes = require("./Router/OwnerBooking.Router");
const userRoutes = require("./Router/Booking.Router");
const DashboardRoutes = require("./Router/dashboardRoutes");
const villaRoutes = require("./Router/villaRoutes");

// Platform Integration routes
const platformIntegrationRoutes = require("./Router/PlatformIntegration.Router");
const villaPublishingRoutes = require("./Router/VillaPublishing.Router");
const emailConfigRoutes = require("./Router/EmailConfig.Router");
const calendarSyncRoutes = require("./Router/CalendarSync.Router");
const platformTesterRoutes = require("./Router/PlatformTester.Router");
const adminVillaIntegrationRoutes = require("./Router/AdminVillaIntegration.Router");
const adminPlatformCredentialsRoutes = require("./Router/AdminPlatformCredentials.Router");

// NEW: Platform Connection & Villa Mapping routes
const platformConnectionRoutes = require("./Router/PlatformConnection.Router");
const villaMappingRoutes = require("./Router/VillaMapping.Router");

// Import Services
const syncScheduler = require("./services/SyncScheduler");

const app = express();

// ====== Middleware ====== //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Enable CORS (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3010",
      "http://127.0.0.1:3000",
      "https://villas.alexandratechlab.com"
    ], // your frontend URL(s)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // allow cookies / tokens if needed
  })
);

// ====== MongoDB Connection ====== //
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Initialize Sync Scheduler after MongoDB connection
    syncScheduler.init();
    console.log("✅ Sync Scheduler initialized");
    console.log("✅ Background services started");
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ====== Routes ====== //
app.use("/api", loginRoutes);
app.use("/api/bookings",bookingRoutes );
app.use("/api/users", userRoutes);
app.use('/api/v1/villas', villaRoutes);
app.use('/api/v1/dashboard', DashboardRoutes);

// Platform Integration Routes
app.use("/api", platformIntegrationRoutes);
app.use("/api/publishing", villaPublishingRoutes);
app.use("/api", emailConfigRoutes);
app.use("/api", calendarSyncRoutes);
app.use("/api", adminVillaIntegrationRoutes);
app.use("/api", adminPlatformCredentialsRoutes);

// NEW: Platform Connection & Villa Mapping Routes
app.use("/api/admin", platformConnectionRoutes);
app.use("/api/admin", villaMappingRoutes);

// Platform Tester Routes (Mock/Sandbox APIs)
app.use("/api", platformTesterRoutes);

// ====== Server Listen ====== //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
