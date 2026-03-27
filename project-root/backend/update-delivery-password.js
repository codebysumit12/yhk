import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

// Update delivery user password
const deliveryUser = await User.findOne({ email: 'delivery@gmail.com' });

if (deliveryUser) {
  // Update role to delivery_partner
  deliveryUser.role = 'delivery_partner';
  
  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Pass123', salt);
  
  deliveryUser.password = hashedPassword;
  await deliveryUser.save();
  
  console.log('✅ Updated delivery user password:');
  console.log('Email: delivery@gmail.com');
  console.log('Password: Pass123');
  console.log('Role:', deliveryUser.role);
  console.log('Name:', deliveryUser.name);
} else {
  console.log('❌ Delivery user not found');
}

await mongoose.disconnect();
