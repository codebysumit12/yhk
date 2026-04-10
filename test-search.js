// Test script to debug search functionality
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './project-root/backend/models/Item.js';

// Load environment variables
dotenv.config({ path: './project-root/backend/.env' });

const testSearch = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk_database');
    console.log('✅ Connected to MongoDB');

    // Get all items to see what's in the database
    const allItems = await Item.find({}).limit(5);
    console.log(`📦 Found ${allItems.length} items in database`);
    
    if (allItems.length > 0) {
      console.log('📝 First item:', {
        _id: allItems[0]._id,
        name: allItems[0].name,
        description: allItems[0].description?.substring(0, 50) + '...'
      });
    }

    // Test search with different queries
    const testQueries = ['banana', 'Ragi', 'black', 'rice', 'sangati'];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing search for: "${query}"`);
      
      // Test 1: Direct regex search
      const regexResults = await Item.find({
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { description: { $regex: new RegExp(query, 'i') } }
        ]
      });
      
      console.log(`  📊 Regex search found: ${regexResults.length} items`);
      if (regexResults.length > 0) {
        regexResults.forEach(item => {
          console.log(`    - ${item.name}`);
        });
      }

      // Test 2: Text search (if index exists)
      try {
        const textResults = await Item.find({
          $text: { $search: query }
        });
        console.log(`  📊 Text search found: ${textResults.length} items`);
      } catch (textError) {
        console.log(`  ❌ Text search failed: ${textError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testSearch();
