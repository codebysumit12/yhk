import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

const existing = await User.findOne({ email: 'admin@kitchen.com' });
if (!existing) {
  await User.create({
    name: 'Admin',
    email: 'admin@kitchen.com',
    phone: '0000000000',
    password: 'admin123',
    role: 'admin',
    isAdmin: true         // Set isAdmin flag for admin privileges
  });
  console.log('✅ Admin created: admin@kitchen.com / admin123');
} else {
  console.log('Admin already exists');
}

await mongoose.disconnect();