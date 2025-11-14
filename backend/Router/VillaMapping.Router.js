const express = require("express");
const router = express.Router();
const {
  getAllMappings,
  getVillaMapping,
  createOrUpdateMapping,
  removePlatformMapping,
  getMappingsByPlatform,
  getOwnerMappings,
  updateSyncStatus,
  getConsolidatedStats,
} = require("../Controller/VillaMapping.Controller");

const AuthMiddleware = require("../Middleware/AuthMiddleware");
const AdminMiddleware = require("../Middleware/AdminMiddleware");

// Admin routes (protected by auth + admin middleware)
router.get("/mappings", AuthMiddleware, AdminMiddleware, getAllMappings);
router.get("/mappings/stats", AuthMiddleware, AdminMiddleware, getConsolidatedStats);
router.get("/mappings/villa/:villaId", AuthMiddleware, AdminMiddleware, getVillaMapping);
router.get("/mappings/platform/:platform", AuthMiddleware, AdminMiddleware, getMappingsByPlatform);
router.get("/mappings/owner/:ownerId", AuthMiddleware, AdminMiddleware, getOwnerMappings);
router.post("/mappings", AuthMiddleware, AdminMiddleware, createOrUpdateMapping);
router.delete("/mappings/villa/:villaId/platform/:platform", AuthMiddleware, AdminMiddleware, removePlatformMapping);
router.put("/mappings/villa/:villaId/platform/:platform/sync", AuthMiddleware, AdminMiddleware, updateSyncStatus);

module.exports = router;
