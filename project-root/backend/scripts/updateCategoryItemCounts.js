import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Item from '../models/Item.js';

import connectDB from '../config/db.js';

const updateCategoryItemCounts = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories`);

    for (const category of categories) {
      // Count actual items in this category
      const itemCount = await Item.countDocuments({ 
        category: category._id,
        isAvailable: true 
      });
      
      // Update category item count
      await Category.findByIdAndUpdate(category._id, { itemCount });
      
      console.log(`Updated ${category.name}: ${itemCount} items`);
    }

    console.log('All category item counts updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating category item counts:', error);
    process.exit(1);
  }
};

updateCategoryItemCounts();
