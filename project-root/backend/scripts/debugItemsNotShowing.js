import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 COMPREHENSIVE ITEMS DEBUG');
  console.log('=============================');
  
  try {
    // 1. Check if we can connect to the database
    console.log('\n📊 Database connection: ✅ Connected');
    
    // 2. Check Item model
    console.log('\n📦 Testing Item model:');
    const allItems = await Item.find({});
    console.log(`Total items in database: ${allItems.length}`);
    
    if (allItems.length === 0) {
      console.log('❌ No items found in database!');
      
      // Check menuitems collection directly
      const db = mongoose.connection.db;
      const menuItems = await db.collection('menuitems').find({}).toArray();
      console.log(`Items in menuitems collection: ${menuItems.length}`);
      
      if (menuItems.length > 0) {
        console.log('Items exist in menuitems but Item model can\'t find them');
        console.log('Sample menuitem:', JSON.stringify(menuItems[0], null, 2));
      }
    } else {
      console.log('✅ Items found:');
      allItems.forEach((item, i) => {
        console.log(`  ${i+1}. ${item.name} - Available: ${item.isAvailable}`);
      });
    }
    
    // 3. Test the exact API query
    console.log('\n🌐 Testing API query: isAvailable=true');
    const availableItems = await Item.find({ isAvailable: true });
    console.log(`Available items: ${availableItems.length}`);
    
    // 4. Simulate API response
    console.log('\n📡 API Response simulation:');
    const apiResponse = {
      success: true,
      count: availableItems.length,
      data: availableItems
    };
    
    console.log('API would return:', JSON.stringify(apiResponse, null, 2));
    
    // 5. Test API endpoint directly
    console.log('\n🔗 Testing actual API endpoint:');
    try {
      const response = await fetch('http://localhost:50017/api/items?isAvailable=true');
      const data = await response.json();
      console.log('API Response status:', response.status);
      console.log('API Response data:', JSON.stringify(data, null, 2));
    } catch (apiError) {
      console.error('❌ API Error:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  }
  
  mongoose.disconnect();
}).catch(console.error);
