const Villa = require('../Models/villaModel');
const Booking = require('../Models/Booking.Model');

// GET /api/v1/dashboard/admin
const getAdminDashboardData = async (req, res) => {
  try {
    // --- 1. BOOKING STATS (Top Cards) ---
    
    const totalBookings = await Booking.countDocuments();
    const confirmed = await Booking.countDocuments({ status: 'Confirmed' });
    const pending = await Booking.countDocuments({ status: 'Pending' });

    // Revenue Calculation (Aapke 'price' field ka sum karega)
    const revenueData = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } } // Yahan 'price' use kiya hai
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // --- 2. RECENT BOOKINGS (Table Data) ---
    const recentBookings = await Booking.find()
      .populate('villa', 'name') // Villa ka naam layega
      .select('villa guestName checkIn checkOut status price') // Sirf zaroori fields layega
      .sort({ createdAt: -1 })
      .limit(5);

    // --- 3. VILLA OVERVIEW (Bottom Section) ---
    const totalVillas = await Villa.countDocuments();
    const availableVillas = await Villa.countDocuments({ status: 'Available' }); // Make sure Villa model me 'status' ho
    const occupiedVillas = await Villa.countDocuments({ status: 'Booked' });

    // Occupancy Rate logic
    const occupancyRate = totalVillas > 0 
      ? ((occupiedVillas / totalVillas) * 100).toFixed(0) 
      : 0;

    const villasList = await Villa.find().sort({ createdAt: -1 }).limit(5);

    // --- RESPONSE ---
    res.status(200).json({
      success: true,
      data: {
        bookingStats: {
          totalBookings,
          confirmedBookings: confirmed,
          pendingBookings: pending,
          totalRevenue
        },
        recentBookings,
        villaStats: {
          totalVillas,
          availableVillas,
          occupiedVillas,
          occupancyRate
        },
        villasList
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Dashboard Data Error', error: error.message });
  }
};

module.exports = { getAdminDashboardData };