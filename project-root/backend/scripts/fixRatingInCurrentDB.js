import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔧 FIXING RATING IN CURRENT DATABASE');
  console.log('===================================');
  console.log(`Connected to: ${process.env.MONGODB_URI}`);
  
  // Find orders for customer with phone 9370337263
  console.log('\n📞 Finding orders for phone 9370337263...');
  const orders = await Order.find({
    'customer.phone': '9370337263'
  });
  
  console.log(`Found ${orders.length} orders:`);
  orders.forEach((order, i) => {
    console.log(`  ${i+1}. ${order.orderNumber} - ${order.customer.name}`);
    console.log(`     Status: ${order.status}`);
    console.log(`     Has Rating: ${!!order.rating}`);
  });
  
  // Add rating to the delivered order without rating
  const deliveredOrder = orders.find(order => 
    order.status === 'delivered' && !order.rating
  );
  
  if (deliveredOrder) {
    console.log(`\n⭐ Adding rating to order ${deliveredOrder.orderNumber}...`);
    
    // Add 4-star rating (as you mentioned in the item data)
    deliveredOrder.rating = {
      stars: 4,
      comment: 'Great food!',
      ratedAt: new Date()
    };
    
    await deliveredOrder.save();
    console.log('✅ Rating added to order');
    
    // Update item ratings
    console.log('\n📊 Updating item ratings...');
    const { updateItemRatings } = await import('../controllers/orderController.js');
    await updateItemRatings(deliveredOrder.orderItems);
    
    // Check final result
    const item = await Item.findById('69c0ddb502811983d1005fc0');
    console.log('\n🎯 FINAL RESULT:');
    console.log(`   Item: ${item.name}`);
    console.log(`   Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
    console.log(`   Sold Count: ${item.soldCount}`);
    
  } else {
    console.log('\n❌ No delivered orders without rating found');
    
    // If all orders have ratings, let's check the item anyway
    const item = await Item.findById('69c0ddb502811983d1005fc0');
    if (item) {
      console.log('\n📊 Current item state:');
      console.log(`   Name: ${item.name}`);
      console.log(`   Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
      console.log(`   Updated: ${item.updatedAt}`);
    }
  }
  
  mongoose.disconnect();
}).catch(console.error);
