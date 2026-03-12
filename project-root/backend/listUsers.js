import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Use hardcoded URI if env is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

// List all users
const users = await User.find({});
console.log('All users in database:');
users.forEach(user => {
  console.log(`- Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
});

await mongoose.disconnect();
