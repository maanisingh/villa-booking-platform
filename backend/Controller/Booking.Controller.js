const Booking = require("../Models/Booking.Model"); // Adjust path if needed

// ✅ CREATE a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      guestName,
      email,
      phone,
      villaName,
      checkIn,
      checkOut,
      price,
      paymentMethod,
      status,
      paymentStatus,
      notes,
    } = req.body;

    // ✅ Validation checks
    if (!guestName || !email || !phone || !villaName || !checkIn || !checkOut || !price) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // ✅ Phone validation (10 digits)
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    // ✅ Create new booking
    const newBooking = new Booking({
      guestName,
      email,
      phone,
      villaName,
      checkIn,
      checkOut,
      price,
      paymentMethod,
      status,
      paymentStatus,
      notes,
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: newBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ GET all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ GET booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error fetching booking by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ✅ UPDATE booking
exports.updateBooking = async (req, res) => {
  try {
    const updateData = req.body;

    // ✅ Optional phone validation if included in update
    if (updateData.phone && !/^[0-9]{10}$/.test(updateData.phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number.",
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ DELETE booking
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
