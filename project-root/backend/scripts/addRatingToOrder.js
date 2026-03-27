import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find any order and mark it as delivered with a rating
  const order = await Order.findOne({});
  
  if (order) {
    console.log('Found order:', order.orderNumber, 'Status:', order.status);
    
    // Mark as delivered and add rating
    order.status = 'delivered';
    order.rating = {
      stars: 1,
      comment: 'Test rating from user',
      ratedAt: new Date()
    };
    
    await order.save();
    console.log('Order updated with rating');
  } else {
    console.log('No orders found');
  }
  
  mongoose.disconnect();
}).catch(console.error);
