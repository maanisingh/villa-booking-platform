const express = require('express');
const router = express.Router();

// Controller Imports
const {
  createVilla,
  getAllVillas,
  getVillaById,
  updateVilla,
  updateMyVilla, // ✨ NEW
  deleteVilla,
  getVillaStats,
  getVillaByOwnerId
} = require('../Controller/villaController');

// ==============================================
// 🚨 IMPORTANT: ORDER MAT BADALNA 🚨
// ==============================================

// 1. Specific Routes (Sabse Pehle)
router.get('/stats', getVillaStats);  // Stats pehle
router.get('/my-villa/:ownerId', getVillaByOwnerId); // ✨ Get ALL owner villas
router.put('/my-villa/:id', updateMyVilla); // ✨ NEW: Owner updates their villa

// 2. General Routes
router.post('/', createVilla);       // Create New
router.get('/', getAllVillas);       // Get All

// 3. ID Routes (Sabse Last Mein)
// Agar isko upar rakha to ye "my-villa" ko bhi ID samajh lega!
router.get('/:id', getVillaById);    
router.put('/:id', updateVilla);
router.delete('/:id', deleteVilla);

module.exports = router;