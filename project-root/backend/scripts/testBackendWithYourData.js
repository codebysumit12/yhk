import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🧪 TESTING BACKEND WITH YOUR DATA');
  console.log('==================================');
  
  // Test fetching all items
  console.log('\n📦 Testing fetch all items:');
  const allItems = await Item.find({});
  console.log(`Found ${allItems.length} items:`);
  
  allItems.forEach((item, i) => {
    console.log(`\n${i+1}. ${item.name}:`);
    console.log(`   ID: ${item._id}`);
    console.log(`   Price: ${item.price}`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Available: ${item.isAvailable}`);
    console.log(`   Ratings: avg=${item.ratings?.average}, count=${item.ratings?.count}`);
  });
  
  // Test fetching by ID
  console.log('\n🔍 Testing fetch by ID:');
  const healthyVegBowl = await Item.findById('69b13bf3979e16e4598f4d76');
  if (healthyVegBowl) {
    console.log('✅ Found Healthy Veg Bowl:');
    console.log(`   Name: ${healthyVegBowl.name}`);
    console.log(`   Ratings: avg=${healthyVegBowl.ratings.average}, count=${healthyVegBowl.ratings.count}`);
  }
  
  // Test API response format
  console.log('\n📡 Testing API response format:');
  const apiResponse = {
    success: true,
    data: allItems.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      category: item.category,
      ratings: item.ratings,
      isAvailable: item.isAvailable
    }))
  };
  
  console.log('API would return:', JSON.stringify(apiResponse, null, 2));
  
  mongoose.disconnect();
}).catch(console.error);
