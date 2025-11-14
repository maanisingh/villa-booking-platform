const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/villa-booking')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const LoginSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, required: true },
      name: { type: String }
    }, { collection: 'logins' });
    
    const Login = mongoose.model('Login', LoginSchema);
    
    // Delete existing admin if any
    await Login.deleteMany({ email: 'admin@villas.com' });
    console.log('🗑️  Cleaned old admin users');
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await Login.create({
      email: 'admin@villas.com',
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User'
    });
    
    console.log('✅ Admin created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   ID:', admin._id);
    
    // Verify
    const verify = await Login.findOne({ email: 'admin@villas.com' });
    const passwordMatch = await bcrypt.compare('admin123', verify.password);
    console.log('✅ Password verification:', passwordMatch ? 'PASSED' : 'FAILED');
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
