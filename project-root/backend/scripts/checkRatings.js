import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const ratedOrders = await Order.find({'rating.stars': { $exists: true, $ne: null }});
  console.log('Rated orders:', ratedOrders.length);
  ratedOrders.forEach(order => {
    console.log(`Order ${order.orderNumber}: ${order.rating.stars} stars, Items: ${order.orderItems.length}`);
    order.orderItems.forEach(item => {
      console.log(`  - Item: ${item.menuItem}`);
    });
  });
  mongoose.disconnect();
}).catch(console.error);
