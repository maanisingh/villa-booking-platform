const Villa = require('../Models/villaModel');
const VillaUpdateService = require('../Services/VillaUpdateService');

// 1. Create Villa (POST)
const createVilla = async (req, res) => {
  try {
    const newVilla = await Villa.create(req.body);
    res.status(201).json({ success: true, data: newVilla });
  } catch (error) {
    res.status(500).json({ message: 'Error creating villa', error: error.message });
  }
};

// 2. Get All Villas (GET)
const getAllVillas = async (req, res) => {
  try {
    const villas = await Villa.find({});
    res.status(200).json(villas);
  } catch (error) {
    console.error('Error fetching all villas:', error);
    res.status(500).json({ message: 'Error fetching villas' });
  }
};

// 3. Get Single Villa by ID (GET /:id)
const getVillaById = async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id);
    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }
    res.status(200).json(villa);
  } catch (error) {
    console.error('Error fetching villa by ID:', error);
    res.status(500).json({ message: 'Error fetching villa' });
  }
};

// ✨ 4. Get ALL Villas by Owner ID (GET /my-villa/:ownerId)
// Isse Owner Dashboard par "My Villas" load hoga (MULTIPLE VILLAS)
const getVillaByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;
    // Find ALL villas where owner matches
    const villas = await Villa.find({ owner: ownerId })
      .sort({ createdAt: -1 });

    if (!villas || villas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No villas found linked to this account.',
        villas: []
      });
    }

    res.status(200).json({
      success: true,
      count: villas.length,
      villas: villas
    });
  } catch (error) {
    console.error("Error finding owner villas:", error);
    res.status(500).json({ message: 'Server Error fetching owner villas', error: error.message });
  }
};

// 5. Update Villa (PUT) - Admin only
const updateVilla = async (req, res) => {
  try {
    const updatedVilla = await Villa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedVilla) return res.status(404).json({ message: 'Villa not found' });
    res.status(200).json(updatedVilla);
  } catch (error) {
    res.status(500).json({ message: 'Error updating villa' });
  }
};

// ✨ 5B. Update Villa by Owner (PUT /my-villa/:id)
// Owner can ONLY update their own villas
// Automatically pushes updates to configured platforms (Airbnb, Booking.com, etc.)
const updateMyVilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { ownerId } = req.body; // Owner ID from request body or auth middleware

    // Verify that this villa belongs to the owner
    const villa = await Villa.findOne({ _id: id, owner: ownerId });

    if (!villa) {
      return res.status(404).json({
        success: false,
        message: 'Villa not found or you do not have permission to edit it'
      });
    }

    // Update villa with new data
    const updatedVilla = await Villa.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).lean(); // Don't populate owner since Owner model doesn't exist

    // 🚀 AUTOMATICALLY PUSH UPDATES TO ALL CONFIGURED PLATFORMS
    let platformSyncResults = null;
    try {
      platformSyncResults = await VillaUpdateService.pushToAllPlatforms(updatedVilla);
      console.log('✅ Platform sync completed:', platformSyncResults);
    } catch (syncError) {
      console.error('⚠️ Platform sync failed (villa still updated):', syncError);
      // Don't fail the request if platform sync fails
    }

    res.status(200).json({
      success: true,
      message: 'Villa updated successfully',
      villa: updatedVilla,
      platformSync: platformSyncResults // Include sync results in response
    });
  } catch (error) {
    console.error("Error updating owner villa:", error);
    res.status(500).json({
      success: false,
      message: 'Error updating villa',
      error: error.message
    });
  }
};

// 6. Delete Villa (DELETE)
const deleteVilla = async (req, res) => {
  try {
    const deletedVilla = await Villa.findByIdAndDelete(req.params.id);
    if (!deletedVilla) return res.status(404).json({ message: 'Villa not found' });
    res.status(200).json({ message: 'Villa deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting villa' });
  }
};

// 7. Stats (GET /stats)
const getVillaStats = async (req, res) => {
  try {
    const totalVillas = await Villa.countDocuments();
    const available = await Villa.countDocuments({ status: 'Available' });
    const assigned = await Villa.countDocuments({ status: 'Assigned' });
    const underMaintenance = await Villa.countDocuments({ status: 'Under Maintenance' });

    // FIX: Don't populate owner field since Owner model doesn't exist
    // The 'owner' field in Villa refers to Login model
    const villasList = await Villa.find({})
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    res.status(200).json({
      success: true,
      stats: { total: totalVillas, available, assigned, underMaintenance },
      villas: villasList,
    });

  } catch (error) {
    console.log("Stats Error:", error);
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};



module.exports = {
  createVilla,
  getAllVillas,
  getVillaById,
  getVillaByOwnerId, // Returns ALL villas for an owner
  updateVilla,
  updateMyVilla, // ✨ NEW: Owner can update their villas
  deleteVilla,
  getVillaStats
};