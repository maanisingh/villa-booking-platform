const express = require("express");
const router = express.Router();
const {
  getAllPlatforms,
  getPlatform,
  connectPlatform,
  updatePlatform,
  disconnectPlatform,
  testPlatformConnection,
  syncPlatform,
  getPlatformStats,
} = require("../Controller/PlatformConnection.Controller");

const AuthMiddleware = require("../Middleware/AuthMiddleware");
const AdminMiddleware = require("../Middleware/AdminMiddleware");

// All routes protected by auth + admin middleware
router.get("/platforms", AuthMiddleware, AdminMiddleware, getAllPlatforms);
router.get("/platforms/stats", AuthMiddleware, AdminMiddleware, getPlatformStats);
router.get("/platforms/:id", AuthMiddleware, AdminMiddleware, getPlatform);
router.post("/platforms/connect", AuthMiddleware, AdminMiddleware, connectPlatform);
router.put("/platforms/:id", AuthMiddleware, AdminMiddleware, updatePlatform);
router.delete("/platforms/:id", AuthMiddleware, AdminMiddleware, disconnectPlatform);
router.post("/platforms/:id/test", AuthMiddleware, AdminMiddleware, testPlatformConnection);
router.post("/platforms/:id/sync", AuthMiddleware, AdminMiddleware, syncPlatform);

module.exports = router;
