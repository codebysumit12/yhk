import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 DEBUGGING API ERROR');
  console.log('=======================');
  
  try {
    // Simulate the exact API call that's failing
    console.log('\n📡 Testing: GET /api/items?isAvailable=true');
    
    const items = await Item.find({ isAvailable: true });
    console.log(`✅ Found ${items.length} items`);
    
    // Test the full controller logic
    console.log('\n🧪 Testing itemController.getItems logic:');
    
    const result = {
      success: true,
      data: items,
      count: items.length
    };
    
    console.log('API Response would be:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
  
  // Check if there are any schema validation issues
  console.log('\n🔍 Checking for schema issues:');
  try {
    const sampleItem = await Item.findOne();
    if (sampleItem) {
      console.log('Sample item looks good:', sampleItem.name);
    }
  } catch (schemaError) {
    console.error('❌ Schema error:', schemaError.message);
  }
  
  mongoose.disconnect();
}).catch(console.error);
