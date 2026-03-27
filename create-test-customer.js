import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './project-root/backend/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function createTestCustomer() {
  try {
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK');
    console.log('✅ Connected to MongoDB');

    // Check if test customer already exists
    const existingCustomer = await User.findOne({ email: 'customer@test.com' });
    if (existingCustomer) {
      console.log('📧 Test customer already exists');
      await mongoose.disconnect();
      return;
    }

    // Create test customer
    const hashedPassword = await bcrypt.hash('customer123', 10);
    const testCustomer = new User({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    await testCustomer.save();
    console.log('✅ Test customer created successfully');
    console.log('   Email: customer@test.com');
    console.log('   Password: customer123');

  } catch (error) {
    console.error('❌ Error creating test customer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestCustomer();
