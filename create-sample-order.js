import mongoose from 'mongoose';
import Order from './project-root/backend/models/Order.js';
import Item from './project-root/backend/models/Item.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yhk-database';

await mongoose.connect(MONGO_URI);

// Check if there are any existing orders
const existingOrders = await Order.find({});
console.log('Existing orders count:', existingOrders.length);

if (existingOrders.length > 0) {
  const sampleOrder = existingOrders[0];
  console.log('\nSample order data:');
  console.log('Status:', sampleOrder.status);
  console.log('Order Type:', sampleOrder.orderType);
  console.log('Full order object:', JSON.stringify(sampleOrder, null, 2));
} else {
  console.log('No orders found in database');
  
  // Check if there are menu items
  const items = await Item.find({});
  console.log('Menu items count:', items.length);
  
  if (items.length > 0) {
    console.log('Creating a sample order...');
    
    const sampleOrder = await Order.create({
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890'
      },
      orderItems: [{
        menuItem: items[0]._id,
        name: items[0].name,
        price: items[0].price,
        quantity: 1,
        subtotal: items[0].price
      }],
      orderType: 'dine_in',
      pricing: {
        subtotal: items[0].price,
        deliveryFee: 0,
        tax: items[0].price * 0.05,
        discount: 0,
        total: items[0].price * 1.05
      },
      paymentMethod: 'cash',
      paymentStatus: 'pending'
    });
    
    console.log('Sample order created:', sampleOrder.orderNumber);
    console.log('Status:', sampleOrder.status);
    console.log('Order Type:', sampleOrder.orderType);
  }
}

await mongoose.disconnect();
