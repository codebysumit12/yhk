import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK';

try {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const email = 'sumitkhekare@gmail.com';
  const existing = await User.findOne({ email });
  
  if (!existing) {
    const hashedPassword = await bcrypt.hash('sumit123', 10);
    await User.create({
      name: 'Sumit Khekare',
      email: email,
      phone: '+919876543210',
      password: hashedPassword,
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true
    });
    console.log('✅ User created: sumitkhekare@gmail.com / sumit123');
  } else {
    console.log('User already exists, updating password...');
    const hashedPassword = await bcrypt.hash('sumit123', 10);
    existing.password = hashedPassword;
    existing.isActive = true;
    existing.isEmailVerified = true;
    existing.isPhoneVerified = true;
    await existing.save();
    console.log('✅ Updated password for sumitkhekare@gmail.com');
  }

  console.log('\n🎉 Your login credentials are:');
  console.log('   📧 Email: sumitkhekare@gmail.com');
  console.log('   🔒 Password: sumit123');
  console.log('\n✨ You can now login to explore delicious meals!');

} catch (error) {
  console.error('❌ Error:', error);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}
