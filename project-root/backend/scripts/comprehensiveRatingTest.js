import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 COMPREHENSIVE RATING SYSTEM TEST');
  console.log('=====================================');
  
  // Step 1: Check current item state
  console.log('\n📊 Step 1: Current Item State');
  const item = await Item.findById('69c0ddb502811983d1005fc0');
  if (item) {
    console.log(`Item: ${item.name}`);
    console.log(`Current ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    console.log(`Updated at: ${item.updatedAt}`);
  } else {
    console.log('❌ Item not found!');
    return;
  }
  
  // Step 2: Check all orders with this item
  console.log('\n📦 Step 2: Orders with this item');
  const ordersWithItem = await Order.find({
    'orderItems.menuItem': '69c0ddb502811983d1005fc0'
  });
  
  console.log(`Found ${ordersWithItem.length} orders with this item:`);
  ordersWithItem.forEach((order, i) => {
    console.log(`  ${i+1}. Order: ${order.orderNumber}`);
    console.log(`     Status: ${order.status}`);
    console.log(`     Rating: ${order.rating?.stars || 'No rating'} stars`);
    console.log(`     Rated at: ${order.rating?.ratedAt || 'Not rated'}`);
  });
  
  // Step 3: Check rated orders specifically
  console.log('\n⭐ Step 3: Rated Orders Analysis');
  const ratedOrders = await Order.find({
    'orderItems.menuItem': '69c0ddb502811983d1005fc0',
    'rating.stars': { $exists: true, $gte: 1 }
  });
  
  console.log(`Found ${ratedOrders.length} rated orders with this item:`);
  let totalStars = 0;
  ratedOrders.forEach((order, i) => {
    console.log(`  ${i+1}. Order: ${order.orderNumber}, Rating: ${order.rating.stars} stars`);
    totalStars += order.rating.stars;
  });
  
  if (ratedOrders.length > 0) {
    const expectedAverage = (totalStars / ratedOrders.length).toFixed(2);
    console.log(`\n🧮 Expected calculations:`);
    console.log(`  Total stars: ${totalStars}`);
    console.log(`  Number of ratings: ${ratedOrders.length}`);
    console.log(`  Expected average: ${expectedAverage}`);
  }
  
  // Step 4: Test the aggregation query directly
  console.log('\n🔍 Step 4: Testing Aggregation Query');
  const aggregation = await Order.aggregate([
    {
      $match: {
        'orderItems.menuItem': { $eq: new mongoose.Types.ObjectId('69c0ddb502811983d1005fc0') },
        'rating.stars': { $gte: 1 }
      }
    },
    {
      $group: {
        _id: null,
        totalStars: { $sum: '$rating.stars' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);
  
  console.log('Aggregation result:', aggregation);
  
  if (aggregation.length > 0) {
    const result = aggregation[0];
    const calculatedAverage = (result.totalStars / result.ratingCount).toFixed(2);
    console.log(`Aggregation calculated: avg=${calculatedAverage}, count=${result.ratingCount}`);
    
    // Step 5: Force update the item
    console.log('\n🔧 Step 5: Force Updating Item');
    await Item.findByIdAndUpdate('69c0ddb502811983d1005fc0', {
      'ratings.average': parseFloat(calculatedAverage),
      'ratings.count': result.ratingCount,
      updatedAt: new Date()
    });
    
    console.log('✅ Item updated successfully');
    
    // Step 6: Verify the update
    console.log('\n✅ Step 6: Verification');
    const updatedItem = await Item.findById('69c0ddb502811983d1005fc0');
    console.log(`Updated item ratings: avg=${updatedItem.ratings.average}, count=${updatedItem.ratings.count}`);
    console.log(`Updated at: ${updatedItem.updatedAt}`);
    
    // Step 7: Test API response format
    console.log('\n📡 Step 7: API Response Test');
    const apiResponse = {
      success: true,
      data: {
        _id: updatedItem._id,
        name: updatedItem.name,
        ratings: updatedItem.ratings,
        soldCount: updatedItem.soldCount
      }
    };
    console.log('API would return:', JSON.stringify(apiResponse, null, 2));
    
  } else {
    console.log('❌ No aggregation results - no rated orders found');
  }
  
  mongoose.disconnect();
}).catch(console.error);
