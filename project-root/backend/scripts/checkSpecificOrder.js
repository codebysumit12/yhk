import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const order = await Order.findOne({orderNumber: 'YHK000052'});
  console.log('Order found:', !!order);
  if (order) {
    console.log('Order status:', order.status);
    console.log('Rating:', order.rating);
    console.log('Order items:', order.orderItems.length);
  }
  mongoose.disconnect();
}).catch(console.error);
