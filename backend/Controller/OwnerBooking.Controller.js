const Booking = require("../Models/OwnerBooking.Model");
const asyncHandler = require("express-async-handler");
const BookingPlatformSync = require("../services/BookingPlatformSync");

// =======================
// ✅ Create New Booking
// =======================
const createBooking = asyncHandler(async (req, res) => {
  try {
    const { villaId, ownerId, guestName, totalFare, startDate, endDate, bookingSource, status, syncToPlatforms } = req.body;

    // Validation
    if (!villaId || !ownerId || !guestName || !totalFare || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Optional: check for overlapping booking
    const overlapping = await Booking.findOne({
      villaId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: "This villa is already booked for the selected dates.",
      });
    }

    // Create booking
    const booking = await Booking.create({
      villaId,
      ownerId,
      guestName,
      totalFare,
      startDate,
      endDate,
      bookingSource: bookingSource || "Manual",
      status: status || "Confirmed",
    });

    // Only sync if syncToPlatforms is true
    let platformSyncResults = null;
    if (syncToPlatforms !== false) {
      try {
        platformSyncResults = await BookingPlatformSync.syncToAllPlatforms(villaId, booking, 'create');
        console.log('✅ Platform sync completed:', platformSyncResults);
      } catch (syncError) {
        console.error('⚠️ Platform sync failed (booking still created):', syncError);
        // Don't fail the request if platform sync fails
      }
    } else {
      console.log('⏭️ Platform sync skipped by user choice');
    }

    res.status(201).json({
      success: true,
      message: platformSyncResults && platformSyncResults.syncedPlatforms > 0
        ? `Booking added and synced to ${platformSyncResults.syncedPlatforms} platform(s)!`
        : "Booking created successfully.",
      data: booking,
      platformSync: platformSyncResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================
// ✅ Get All Bookings
// =======================
const getAllBookings = asyncHandler(async (req, res) => {
  try {
    let bookings;

    try {
      // Try populate both villaId and ownerId
      bookings = await Booking.find()
        .populate("villaId", "villaName")
        .populate("ownerId", "name email")  // may fail if "Owner" not registered
        .sort({ createdAt: -1 });
    } catch (populateError) {
      console.warn("⚠️ 'Owner' model not registered — skipping populate(ownerId)");

      // fallback: fetch without populate
      bookings = await Booking.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      message: "All bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// =======================
// ✅ Get Booking by ID
// =======================
const getBookingById = asyncHandler(async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("villaId", "villaName")
      .populate("ownerId", "name email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================
// ✅ Update Booking
// =======================
const updateBooking = asyncHandler(async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Only sync if syncToPlatforms is true
    let platformSyncResults = null;
    if (req.body.syncToPlatforms !== false) {
      try {
        platformSyncResults = await BookingPlatformSync.syncToAllPlatforms(
          updatedBooking.villaId,
          updatedBooking,
          'update'
        );
        console.log('✅ Platform sync completed:', platformSyncResults);
      } catch (syncError) {
        console.error('⚠️ Platform sync failed (booking still updated):', syncError);
      }
    } else {
      console.log('⏭️ Platform sync skipped by user choice');
    }

    res.status(200).json({
      success: true,
      message: platformSyncResults && platformSyncResults.syncedPlatforms > 0
        ? `Booking updated and synced to ${platformSyncResults.syncedPlatforms} platform(s)!`
        : "Booking updated successfully.",
      data: updatedBooking,
      platformSync: platformSyncResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================
// ✅ Delete Booking
// =======================
const deleteBooking = asyncHandler(async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // Only sync if syncToPlatforms is true (defaults to true for deletes to maintain sync)
    let platformSyncResults = null;
    if (req.body.syncToPlatforms !== false) {
      try {
        platformSyncResults = await BookingPlatformSync.syncToAllPlatforms(
          booking.villaId,
          booking,
          'delete'
        );
        console.log('✅ Platform sync completed:', platformSyncResults);
      } catch (syncError) {
        console.error('⚠️ Platform sync failed (booking will still be deleted):', syncError);
      }
    } else {
      console.log('⏭️ Platform sync skipped by user choice');
    }

    // Now delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: platformSyncResults && platformSyncResults.syncedPlatforms > 0
        ? `Booking deleted and synced to ${platformSyncResults.syncedPlatforms} platform(s)!`
        : "Booking deleted successfully.",
      platformSync: platformSyncResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
