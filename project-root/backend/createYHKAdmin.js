import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

const existing = await User.findOne({ email: 'admin@yhk.com' });
if (!existing) {
  await User.create({
    name: 'Admin',
    email: 'admin@yhk.com',
    phone: '9876543210',
    password: 'admin123',
    role: 'admin'
  });
  console.log('✅ Admin created: admin@yhk.com / admin123');
} else {
  console.log('admin@yhk.com already exists, updating role to admin');
  existing.role = 'admin';
  await existing.save();
  console.log('✅ Updated admin@yhk.com to admin role');
}

await mongoose.disconnect();
