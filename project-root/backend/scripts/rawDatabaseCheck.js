import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 RAW DATABASE CHECK');
  console.log('====================');
  console.log(`Connected to: ${process.env.MONGODB_URI}`);
  
  // Check the exact item
  console.log('\n📊 Item 69c0ddb502811983d1005fc0:');
  const item = await Item.findById('69c0ddb502811983d1005fc0');
  
  if (item) {
    console.log('RAW ITEM DATA:');
    console.log(JSON.stringify(item, null, 2));
  } else {
    console.log('❌ Item not found');
  }
  
  // Check ALL orders with this item
  console.log('\n📦 ALL orders with this item:');
  const orders = await Order.find({
    'orderItems.menuItem': '69c0ddb502811983d1005fc0'
  });
  
  console.log(`Found ${orders.length} orders:`);
  orders.forEach((order, i) => {
    console.log(`\n${i+1}. Order ${order.orderNumber}:`);
    console.log('RAW ORDER DATA:');
    console.log(JSON.stringify({
      orderNumber: order.orderNumber,
      status: order.status,
      rating: order.rating,
      customer: order.customer,
      orderItems: order.orderItems.map(oi => ({
        name: oi.name,
        menuItem: oi.menuItem
      }))
    }, null, 2));
  });
  
  // Check if there are ANY rated orders at all
  console.log('\n⭐ ALL RATED ORDERS:');
  const ratedOrders = await Order.find({
    'rating.stars': { $exists: true }
  });
  
  console.log(`Total rated orders: ${ratedOrders.length}`);
  ratedOrders.forEach((order, i) => {
    console.log(`${i+1}. ${order.orderNumber}: ${order.rating.stars} stars`);
  });
  
  // If item exists but has no ratings, let's create some test data
  if (item && item.ratings.count === 0) {
    console.log('\n🔧 Item has no ratings - creating test data...');
    
    // Check if we have any delivered orders to rate
    const deliveredOrders = await Order.find({
      'orderItems.menuItem': '69c0ddb502811983d1005fc0',
      status: 'delivered'
    });
    
    if (deliveredOrders.length > 0) {
      const orderToRate = deliveredOrders[0];
      console.log(`Rating order ${orderToRate.orderNumber}...`);
      
      // Add rating
      orderToRate.rating = {
        stars: 4,
        comment: 'Test rating - customer loved it!',
        ratedAt: new Date()
      };
      
      await orderToRate.save();
      console.log('✅ Order rated');
      
      // Update item ratings
      const { updateItemRatings } = await import('../controllers/orderController.js');
      await updateItemRatings(orderToRate.orderItems);
      
      // Check result
      const updatedItem = await Item.findById('69c0ddb502811983d1005fc0');
      console.log('\n🎯 UPDATED ITEM:');
      console.log(`Ratings: avg=${updatedItem.ratings.average}, count=${updatedItem.ratings.count}`);
    } else {
      console.log('❌ No delivered orders found to rate');
    }
  }
  
  mongoose.disconnect();
}).catch(console.error);
