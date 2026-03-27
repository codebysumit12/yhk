import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 DEBUGGING MENU FETCHING ISSUE');
  console.log('==================================');
  
  // Check what the Item model expects vs what menuitems has
  const db = mongoose.connection.db;
  const menuItemsCollection = db.collection('menuitems');
  
  // Get sample menuitem structure
  const sampleMenuItem = await menuItemsCollection.findOne({});
  console.log('\n📋 Your menuitems structure:');
  console.log(JSON.stringify(sampleMenuItem, null, 2));
  
  // Check what fields are missing that frontend might expect
  console.log('\n🔍 Checking required fields:');
  
  const requiredFields = [
    'name', 'price', 'description', 'category', 'isAvailable', 
    'preparationTime', 'image', 'imageUrl', 'images', 'slug'
  ];
  
  requiredFields.forEach(field => {
    const hasField = sampleMenuItem.hasOwnProperty(field);
    console.log(`${field}: ${hasField ? '✅' : '❌'}`);
  });
  
  // Test the Item model directly
  console.log('\n🧪 Testing Item model:');
  try {
    const Item = mongoose.model('Item');
    const items = await Item.find({}).limit(1);
    console.log(`✅ Item model found ${items.length} items`);
    if (items.length > 0) {
      console.log('Sample item from model:', JSON.stringify(items[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Item model error:', error.message);
  }
  
  // Check API endpoint that frontend calls
  console.log('\n📡 Testing API endpoint simulation:');
  console.log('Frontend calls: GET /api/items?isAvailable=true');
  
  try {
    const items = await menuItemsCollection.find({ isAvailable: true }).toArray();
    console.log(`Found ${items.length} available items`);
    
    // Simulate API response
    const apiResponse = {
      success: true,
      data: items
    };
    
    console.log('API Response would be:', JSON.stringify(apiResponse, null, 2));
  } catch (error) {
    console.log('❌ API simulation error:', error.message);
  }
  
  mongoose.disconnect();
}).catch(console.error);
