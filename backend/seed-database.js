const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Get MongoDB URI from environment or use default
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/villa_booking';

// Import models
const Login = require('./Models/Login.Model');
const Villa = require('./Models/villaModel');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    console.log('📍 MongoDB URI:', MONGO_URI);

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ===================================
    // 1. CREATE ADMIN USER
    // ===================================
    console.log('\n👤 Creating Admin User...');

    // Check if admin exists
    let admin = await Login.findOne({ email: 'admin@gmail.com' });

    if (admin) {
      console.log('ℹ️  Admin already exists');
    } else {
      const hashedPassword = await bcrypt.hash('123', 10);
      admin = await Login.create({
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User'
      });
      console.log('✅ Admin created!');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: 123');
    }

    // ===================================
    // 2. CREATE TEST OWNER
    // ===================================
    console.log('\n🏠 Creating Test Owner...');

    // Check if owner exists
    let owner = await Login.findOne({ email: 'testowner@villa.com' });

    if (owner) {
      console.log('ℹ️  Owner already exists');
    } else {
      // Create owner login
      const hashedPassword = await bcrypt.hash('password123', 10);
      owner = await Login.create({
        name: 'Test Owner',
        email: 'testowner@villa.com',
        password: hashedPassword,
        phoneNumber: '+1234567890',
        role: 'owner',
        status: 'Active'
      });

      console.log('✅ Owner created!');
      console.log('   Email: testowner@villa.com');
      console.log('   Password: password123');
      console.log('   Owner ID:', owner._id);
    }

    // ===================================
    // 3. CREATE SAMPLE VILLAS
    // ===================================
    console.log('\n🏝️  Creating Sample Villas...');

    const sampleVillas = [
      {
        name: 'Sunset Beach Villa',
        location: 'Seminyak, Bali',
        description: 'Luxurious beachfront villa with stunning ocean views and private pool. Perfect for families and groups.',
        price: '450',
        status: 'Available',
        owner: owner._id,
        amenities: ['WiFi', 'Swimming Pool', 'Air Conditioning', 'Beach Access', 'Kitchen', 'BBQ Area'],
        type: '4BHK',
        area: '350'
      },
      {
        name: 'Mountain View Retreat',
        location: 'Ubud, Bali',
        description: 'Peaceful mountain villa surrounded by rice terraces. Experience authentic Balinese culture.',
        price: '320',
        status: 'Available',
        owner: owner._id,
        amenities: ['WiFi', 'Garden', 'Kitchen', 'Yoga Space', 'Mountain View'],
        type: '3BHK',
        area: '280'
      },
      {
        name: 'Modern City Loft',
        location: 'Canggu, Bali',
        description: 'Contemporary loft-style villa near the beach with rooftop terrace and modern amenities.',
        price: '380',
        status: 'Available',
        owner: owner._id,
        amenities: ['WiFi', 'Rooftop Terrace', 'Air Conditioning', 'Kitchen', 'Parking'],
        type: '2BHK',
        area: '200'
      },
      {
        name: 'Tropical Garden Villa',
        location: 'Sanur, Bali',
        description: 'Charming villa with lush tropical garden, perfect for a relaxing getaway.',
        price: '290',
        status: 'Available',
        owner: owner._id,
        amenities: ['WiFi', 'Garden', 'Swimming Pool', 'Kitchen', 'Outdoor Dining'],
        type: '3BHK',
        area: '300'
      },
      {
        name: 'Luxury Cliff Villa',
        location: 'Uluwatu, Bali',
        description: 'Spectacular cliff-top villa with infinity pool and breathtaking ocean views.',
        price: '650',
        status: 'Available',
        owner: owner._id,
        amenities: ['WiFi', 'Infinity Pool', 'Ocean View', 'Air Conditioning', 'Butler Service', 'Gym'],
        type: '5BHK',
        area: '500'
      }
    ];

    // Check if villas already exist
    const existingVillas = await Villa.find({ owner: owner._id });

    if (existingVillas.length > 0) {
      console.log(`ℹ️  ${existingVillas.length} villas already exist for this owner`);
    } else {
      // Create villas
      const createdVillas = await Villa.insertMany(sampleVillas);
      console.log(`✅ Created ${createdVillas.length} sample villas!`);

      createdVillas.forEach((villa, index) => {
        console.log(`   ${index + 1}. ${villa.name} - $${villa.price}/night`);
      });
    }

    // ===================================
    // 4. SUMMARY
    // ===================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE SEEDING COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalLogins = await Login.countDocuments();
    const totalOwners = await Login.countDocuments({ role: 'owner' });
    const totalVillas = await Villa.countDocuments();

    console.log('\n📊 Database Summary:');
    console.log(`   👥 Total Users: ${totalLogins}`);
    console.log(`   🏠 Owners: ${totalOwners}`);
    console.log(`   🏝️  Villas: ${totalVillas}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   ╔══════════════════════════════════╗');
    console.log('   ║          ADMIN LOGIN             ║');
    console.log('   ╠══════════════════════════════════╣');
    console.log('   ║ Email: admin@gmail.com           ║');
    console.log('   ║ Password: 123                    ║');
    console.log('   ╚══════════════════════════════════╝');
    console.log('');
    console.log('   ╔══════════════════════════════════╗');
    console.log('   ║          OWNER LOGIN             ║');
    console.log('   ╠══════════════════════════════════╣');
    console.log('   ║ Email: testowner@villa.com       ║');
    console.log('   ║ Password: password123            ║');
    console.log('   ╚══════════════════════════════════╝');
    console.log('');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
