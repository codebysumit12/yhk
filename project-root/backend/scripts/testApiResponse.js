import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 Testing API response for item...');
  
  // Find the item exactly as the API would
  const item = await Item.findById('69c0ddb502811983d1005fc0');
  
  if (item) {
    console.log('Item found in database:');
    console.log(`  Name: ${item.name}`);
    console.log(`  Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    console.log(`  Sold Count: ${item.soldCount}`);
    
    // Simulate the API response structure
    const apiResponse = {
      success: true,
      data: {
        _id: item._id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        discountPrice: item.discountPrice,
        images: item.images,
        ratings: item.ratings,
        soldCount: item.soldCount,
        isAvailable: item.isAvailable
      }
    };
    
    console.log('\n📡 API Response would be:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // Check if there are multiple items with the same slug
    const slugItems = await Item.find({ slug: 'tyytty' });
    console.log(`\nFound ${slugItems.length} items with slug 'tyytty':`);
    slugItems.forEach((item, i) => {
      console.log(`  ${i+1}. ID: ${item._id}, Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    });
    
  } else {
    console.log('❌ Item not found in database');
  }
  
  mongoose.disconnect();
}).catch(console.error);
