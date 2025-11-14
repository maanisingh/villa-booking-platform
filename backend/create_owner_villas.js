const mongoose = require('mongoose');

const villaSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  price: Number,
  ownerLinked: String,
  amenities: [String],
  platformIntegration: mongoose.Schema.Types.Mixed
});

const Villa = mongoose.model('Villa', villaSchema);

async function createVillas() {
  try {
    await mongoose.connect('mongodb://localhost:27018/villaBooking');
    console.log('✅ Connected to MongoDB');
    
    const ownerVillas = await Villa.find({ ownerLinked: '69161a3ba7ec11a206cfai178' });
    console.log('Current owner villas:', ownerVillas.length);
    
    if (ownerVillas.length === 0) {
      const villa1 = await Villa.create({
        name: 'Sunset Beach Villa',
        location: 'Bali, Indonesia',
        description: 'Luxury beachfront villa with stunning sunset views',
        price: 350,
        ownerLinked: '69161a3ba7ec11a206cfai178',
        amenities: ['Wifi', 'Swimming Pool', 'Air Conditioning', 'Free Parking']
      });
      
      const villa2 = await Villa.create({
        name: 'Mountain Retreat Villa',
        location: 'Ubud, Bali',
        description: 'Peaceful mountain villa surrounded by rice terraces',
        price: 280,
        ownerLinked: '69161a3ba7ec11a206cfai178',
        amenities: ['Wifi', 'Garden', 'Kitchen', 'Hot Water']
      });
      
      console.log('✅ Created:', villa1.name);
      console.log('✅ Created:', villa2.name);
    }
    
    const finalVillas = await Villa.find({ ownerLinked: '69161a3ba7ec11a206cfai178' });
    console.log('\n✅ Total villas for owner:', finalVillas.length);
    finalVillas.forEach(v => console.log('  -', v.name));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createVillas();
