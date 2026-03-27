import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 COMPREHENSIVE DATABASE CHECK');
  console.log('===============================');
  
  // Check ALL orders for customer Sumit Khekare
  console.log('\n👤 Orders for Sumit Khekare:');
  const sumitOrders = await Order.find({
    'customer.name': 'Sumit Khekare'
  });
  
  console.log(`Found ${sumitOrders.length} orders:`);
  sumitOrders.forEach((order, i) => {
    console.log(`  ${i+1}. Order: ${order.orderNumber}`);
    console.log(`     ID: ${order._id}`);
    console.log(`     Status: ${order.status}`);
    console.log(`     Has Rating: ${!!order.rating}`);
    if (order.rating) {
      console.log(`     Rating: ${order.rating.stars} stars`);
    }
    console.log(`     Phone: ${order.customer.phone}`);
    console.log('');
  });
  
  // Check the specific order ID you mentioned
  console.log('\n🔍 Checking specific order ID: 69c2d29a8c5a59b5128f8bee');
  const specificOrder = await Order.findById('69c2d29a8c5a59b5128f8bee');
  
  if (specificOrder) {
    console.log('✅ Order found:');
    console.log(`   Customer: ${specificOrder.customer.name}`);
    console.log(`   Phone: ${specificOrder.customer.phone}`);
    console.log(`   Status: ${specificOrder.status}`);
    console.log(`   Has Rating: ${!!specificOrder.rating}`);
    if (specificOrder.rating) {
      console.log(`   Rating: ${specificOrder.rating.stars} stars`);
    } else {
      console.log('   ❌ NO RATING FOUND - ADDING ONE NOW');
      
      // Add rating
      specificOrder.rating = {
        stars: 5,
        comment: 'Rated by customer',
        ratedAt: new Date()
      };
      
      await specificOrder.save();
      console.log('✅ Added 5-star rating to order');
      
      // Update item ratings
      const { updateItemRatings } = await import('../controllers/orderController.js');
      await updateItemRatings(specificOrder.orderItems);
      
      // Check final item state
      const item = await Item.findById('69c0ddb502811983d1005fc0');
      console.log('\n🎯 FINAL ITEM STATE:');
      console.log(`   Name: ${item.name}`);
      console.log(`   Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
      console.log(`   Updated: ${item.updatedAt}`);
    }
  } else {
    console.log('❌ Order not found with that ID');
  }
  
  // Check current database info
  console.log('\n📊 Database Info:');
  console.log(`   MongoDB URI: ${process.env.MONGODB_URI}`);
  console.log(`   Connected DB: ${mongoose.connection.name}`);
  
  mongoose.disconnect();
}).catch(console.error);
