const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27018/villaBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  try {
    // Get collections
    const villasCollection = db.collection('villas');
    const bookingsCollection = db.collection('bookings');
    const loginsCollection = db.collection('logins');

    // Get owner IDs
    const admin = await loginsCollection.findOne({ Email: 'admin@gmail.com' });
    const testOwner = await loginsCollection.findOne({ Email: 'testowner@villa.com' });

    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    const ownerId = testOwner ? testOwner._id.toString() : admin._id.toString();
    console.log('Using owner ID:', ownerId);

    // Clear existing data
    await villasCollection.deleteMany({});
    await bookingsCollection.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Sample Villas
    const sampleVillas = [
      {
        name: 'Sunset Beach Villa',
        description: 'Luxurious 4-bedroom beachfront villa with stunning ocean views, infinity pool, and private beach access. Perfect for families and groups seeking an unforgettable tropical getaway.',
        location: 'Bali, Indonesia',
        price: 450,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        amenities: ['WiFi', 'Pool', 'Beach Access', 'Air Conditioning', 'Kitchen', 'Parking', 'BBQ Grill', 'Ocean View'],
        images: [
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        ],
        availability: true,
        ownerId: ownerId,
        status: 'Active',
        rating: 4.8,
        totalReviews: 124,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mountain View Retreat',
        description: 'Cozy 3-bedroom mountain villa surrounded by lush forests. Features a fireplace, hot tub, and panoramic mountain views. Ideal for nature lovers and romantic getaways.',
        location: 'Ubud, Bali',
        price: 320,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['WiFi', 'Hot Tub', 'Fireplace', 'Mountain View', 'Kitchen', 'Parking', 'Hiking Trails'],
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        ],
        availability: true,
        ownerId: ownerId,
        status: 'Active',
        rating: 4.9,
        totalReviews: 89,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Modern City Loft',
        description: 'Stylish 2-bedroom loft in the heart of Seminyak. Walking distance to restaurants, shops, and nightlife. Features modern amenities and rooftop terrace.',
        location: 'Seminyak, Bali',
        price: 280,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Rooftop Terrace', 'Smart TV', 'Gym Access'],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        ],
        availability: true,
        ownerId: ownerId,
        status: 'Active',
        rating: 4.7,
        totalReviews: 56,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Tropical Garden Villa',
        description: 'Serene 5-bedroom villa set in tropical gardens with private pool and outdoor dining area. Perfect for weddings, events, or large family gatherings.',
        location: 'Canggu, Bali',
        price: 550,
        bedrooms: 5,
        bathrooms: 4,
        maxGuests: 10,
        amenities: ['WiFi', 'Private Pool', 'Garden', 'Outdoor Dining', 'Kitchen', 'Parking', 'Event Space', 'Staff'],
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        ],
        availability: true,
        ownerId: ownerId,
        status: 'Active',
        rating: 5.0,
        totalReviews: 142,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedVillas = await villasCollection.insertMany(sampleVillas);
    console.log(`✅ Added ${insertedVillas.insertedCount} villas`);

    // Get villa IDs for bookings
    const villaIds = Object.values(insertedVillas.insertedIds);

    // Sample Bookings
    const today = new Date();
    const sampleBookings = [
      {
        villaId: villaIds[0],
        villaName: 'Sunset Beach Villa',
        guestName: 'John Smith',
        guestEmail: 'john.smith@example.com',
        guestPhone: '+1 555-0101',
        checkIn: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checkOut: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        numberOfGuests: 6,
        totalPrice: 3150, // 7 nights * $450
        status: 'Confirmed',
        source: 'Direct',
        paymentStatus: 'Paid',
        specialRequests: 'Early check-in if possible, baby crib needed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        villaId: villaIds[1],
        villaName: 'Mountain View Retreat',
        guestName: 'Sarah Johnson',
        guestEmail: 'sarah.j@example.com',
        guestPhone: '+1 555-0102',
        checkIn: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        checkOut: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        numberOfGuests: 4,
        totalPrice: 1600, // 5 nights * $320
        status: 'Confirmed',
        source: 'Airbnb',
        paymentStatus: 'Paid',
        specialRequests: 'Anniversary celebration - flowers would be appreciated',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        villaId: villaIds[2],
        villaName: 'Modern City Loft',
        guestName: 'Mike Chen',
        guestEmail: 'mike.chen@example.com',
        guestPhone: '+1 555-0103',
        checkIn: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        checkOut: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        numberOfGuests: 2,
        totalPrice: 840, // 3 nights * $280
        status: 'Confirmed',
        source: 'Booking.com',
        paymentStatus: 'Pending',
        specialRequests: 'Late check-out requested',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        villaId: villaIds[3],
        villaName: 'Tropical Garden Villa',
        guestName: 'Emily Davis',
        guestEmail: 'emily.davis@example.com',
        guestPhone: '+1 555-0104',
        checkIn: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (current guest)
        checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        numberOfGuests: 10,
        totalPrice: 3850, // 7 nights * $550
        status: 'CheckedIn',
        source: 'Direct',
        paymentStatus: 'Paid',
        specialRequests: 'Wedding event on property',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        villaId: villaIds[0],
        villaName: 'Sunset Beach Villa',
        guestName: 'Robert Taylor',
        guestEmail: 'rob.taylor@example.com',
        guestPhone: '+1 555-0105',
        checkIn: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        checkOut: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (past)
        numberOfGuests: 5,
        totalPrice: 3150, // 7 nights * $450
        status: 'Completed',
        source: 'Airbnb',
        paymentStatus: 'Paid',
        specialRequests: 'None',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedBookings = await bookingsCollection.insertMany(sampleBookings);
    console.log(`✅ Added ${insertedBookings.insertedCount} bookings`);

    console.log('\n📊 Database Summary:');
    console.log(`   Villas: ${await villasCollection.countDocuments()}`);
    console.log(`   Bookings: ${await bookingsCollection.countDocuments()}`);
    console.log(`   Owners: ${await loginsCollection.countDocuments()}`);

    console.log('\n✅ Sample data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
});
