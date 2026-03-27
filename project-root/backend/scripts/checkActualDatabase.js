import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING ACTUAL DATABASE STATE');
  console.log('===================================');
  
  // Check the exact item you mentioned
  console.log('\n📊 Item 69c0ddb502811983d1005fc0:');
  const item = await Item.findById('69c0ddb502811983d1005fc0');
  
  if (item) {
    console.log('✅ Item found:');
    console.log(`   Name: "${item.name}"`);
    console.log(`   Ratings: average=${item.ratings.average}, count=${item.ratings.count}`);
    console.log(`   Sold Count: ${item.soldCount}`);
    console.log(`   Updated: ${item.updatedAt}`);
  } else {
    console.log('❌ Item not found in database!');
  }
  
  // Check all orders to see if any have this item
  console.log('\n📦 Checking orders with this item:');
  const ordersWithItem = await Order.find({
    'orderItems.menuItem': '69c0ddb502811983d1005fc0'
  });
  
  console.log(`Found ${ordersWithItem.length} orders:`);
  ordersWithItem.forEach((order, i) => {
    console.log(`  ${i+1}. Order: ${order.orderNumber}`);
    console.log(`     Status: ${order.status}`);
    console.log(`     Has Rating: ${!!order.rating?.stars}`);
    if (order.rating?.stars) {
      console.log(`     Rating: ${order.rating.stars} stars`);
    }
  });
  
  // Check if there are ANY rated orders at all
  console.log('\n⭐ All rated orders in database:');
  const allRatedOrders = await Order.find({
    'rating.stars': { $exists: true, $gte: 1 }
  });
  
  console.log(`Total rated orders: ${allRatedOrders.length}`);
  allRatedOrders.forEach((order, i) => {
    console.log(`  ${i+1}. ${order.orderNumber}: ${order.rating.stars} stars`);
    if (order.orderItems && order.orderItems.length > 0) {
      console.log(`      Item: ${order.orderItems[0].name} (${order.orderItems[0].menuItem})`);
    }
  });
  
  // Force update if item exists but ratings are wrong
  if (item && (item.ratings.average === 0 || item.ratings.count === 0)) {
    console.log('\n🔧 Item exists but has zero ratings - fixing...');
    
    // Calculate actual ratings from orders
    const ratedOrdersForItem = await Order.find({
      'orderItems.menuItem': '69c0ddb502811983d1005fc0',
      'rating.stars': { $exists: true, $gte: 1 }
    });
    
    if (ratedOrdersForItem.length > 0) {
      const totalStars = ratedOrdersForItem.reduce((sum, order) => sum + order.rating.stars, 0);
      const averageRating = (totalStars / ratedOrdersForItem.length).toFixed(2);
      
      console.log(`Found ${ratedOrdersForItem.length} rated orders for this item`);
      console.log(`Total stars: ${totalStars}, Average: ${averageRating}`);
      
      // Update the item
      await Item.findByIdAndUpdate('69c0ddb502811983d1005fc0', {
        'ratings.average': parseFloat(averageRating),
        'ratings.count': ratedOrdersForItem.length
      });
      
      console.log('✅ Item ratings updated in database');
      
      // Verify the update
      const updatedItem = await Item.findById('69c0ddb502811983d1005fc0');
      console.log(`New ratings: avg=${updatedItem.ratings.average}, count=${updatedItem.ratings.count}`);
    } else {
      console.log('❌ No rated orders found for this item');
    }
  }
  
  mongoose.disconnect();
}).catch(console.error);
