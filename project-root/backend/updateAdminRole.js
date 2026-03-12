import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

// Update existing admin@yhk.com user to have admin role
const adminUser = await User.findOne({ email: 'admin@yhk.com' });
if (adminUser) {
  adminUser.role = 'admin';
  await adminUser.save();
  console.log('✅ Updated admin@yhk.com to admin role');
} else {
  console.log('❌ admin@yhk.com not found');
}

await mongoose.disconnect();
