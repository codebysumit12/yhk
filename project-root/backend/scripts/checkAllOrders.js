import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const orders = await Order.find({});
  console.log('Total orders:', orders.length);
  
  // Show last 5 orders
  const recentOrders = orders.slice(-5);
  recentOrders.forEach(order => {
    console.log(`Order ${order.orderNumber}: Status=${order.status}, Rating=${order.rating?.stars || 'none'}`);
  });
  
  mongoose.disconnect();
}).catch(console.error);
