import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import dotenv from 'dotenv';

dotenv.config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure text indexes exist
    await MenuItem.collection.createIndex({ 
      name: 'text', 
      description: 'text', 
      tags: 'text' 
    });

    console.log('✅ Text indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createIndexes();
