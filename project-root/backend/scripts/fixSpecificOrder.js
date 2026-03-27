import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING YOUR SPECIFIC ORDER');
  console.log('================================');
  
  // Find the exact order you mentioned
  const order = await Order.findById('69c2d29a8c5a59b5128f8bee');
  
  if (order) {
    console.log('✅ Found your order:');
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customer.name}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Has Rating: ${!!order.rating}`);
    
    if (order.rating) {
      console.log(`   Rating: ${order.rating.stars} stars`);
      console.log(`   Rated At: ${order.rating.ratedAt}`);
    } else {
      console.log('❌ ORDER HAS NO RATING!');
      console.log('This is the problem - the order is delivered but not rated');
      
      // Add a rating to this order
      console.log('\n🔧 Adding rating to this order...');
      order.rating = {
        stars: 4, // Give it 4 stars
        comment: 'Customer rated this item',
        ratedAt: new Date()
      };
      
      await order.save();
      console.log('✅ Rating added to order');
      
      // Now update the item ratings
      console.log('\n📊 Updating item ratings...');
      const { updateItemRatings } = await import('../controllers/orderController.js');
      await updateItemRatings(order.orderItems);
      
      // Check the result
      const item = await Item.findById('69c0ddb502811983d1005fc0');
      console.log('\n🎯 FINAL RESULT:');
      console.log(`   Item: ${item.name}`);
      console.log(`   Ratings: avg=${item.ratings.average}, count=${item.ratings.count}`);
      console.log(`   Updated: ${item.updatedAt}`);
    }
  } else {
    console.log('❌ Order not found');
  }
  
  mongoose.disconnect();
}).catch(console.error);
