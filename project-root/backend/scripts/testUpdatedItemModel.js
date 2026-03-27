import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🧪 TESTING UPDATED ITEM MODEL');
  console.log('===============================');
  
  try {
    // Test fetching all available items
    console.log('\n📦 Fetching available items:');
    const availableItems = await Item.find({ isAvailable: true });
    
    console.log(`Found ${availableItems.length} available items:`);
    availableItems.forEach((item, i) => {
      console.log(`\n${i+1}. ${item.name}:`);
      console.log(`   Price: ${item.price}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Image: ${item.image}`);
      console.log(`   Available: ${item.isAvailable}`);
      console.log(`   Prep Time: ${item.preparationTime} min`);
      console.log(`   Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    });
    
    // Test API response format
    console.log('\n📡 API Response Format:');
    const apiResponse = {
      success: true,
      data: availableItems.map(item => ({
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        ratings: item.ratings,
        soldCount: item.soldCount
      }))
    };
    
    console.log('API would return:', JSON.stringify(apiResponse, null, 2));
    
    console.log('\n✅ SUCCESS! Items are now fetching correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  mongoose.disconnect();
}).catch(console.error);
