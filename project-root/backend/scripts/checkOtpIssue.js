import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 Checking OTP verification issue...');
  
  // Find orders with out-for-delivery status
  const orders = await Order.find({ status: 'out-for-delivery' });
  
  if (orders.length === 0) {
    console.log('No orders with out-for-delivery status found');
    
    // Check all orders
    const allOrders = await Order.find({});
    console.log('All orders:');
    allOrders.forEach(order => {
      console.log(`  ${order.orderNumber}: ${order.status}`);
    });
  } else {
    console.log(`Found ${orders.length} orders out-for-delivery:`);
    orders.forEach(order => {
      console.log(`  ${order.orderNumber} - Customer: ${order.customer.phone} - Status: ${order.status}`);
    });
  }
  
  // Check if there are any delivered orders
  const deliveredOrders = await Order.find({ status: 'delivered' });
  console.log(`\nDelivered orders: ${deliveredOrders.length}`);
  
  mongoose.disconnect();
}).catch(console.error);
