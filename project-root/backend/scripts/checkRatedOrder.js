import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find the rated order
  const ratedOrder = await Order.findOne({'rating.stars': { $exists: true }});
  
  if (ratedOrder) {
    console.log('Rated order:', ratedOrder.orderNumber);
    console.log('Rating:', ratedOrder.rating);
    console.log('Order items:');
    ratedOrder.orderItems.forEach((item, i) => {
      console.log(`  ${i+1}. MenuItem ID: ${item.menuItem}, Name: ${item.name}`);
    });
  } else {
    console.log('No rated orders found');
  }
  
  mongoose.disconnect();
}).catch(console.error);
