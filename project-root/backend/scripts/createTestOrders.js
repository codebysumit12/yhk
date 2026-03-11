import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

const createTestOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yhk_database');

    // Get a sample menu item
    const menuItem = await MenuItem.findOne();
    
    if (!menuItem) {
      console.log('❌ No menu items found. Please create menu items first.');
      process.exit(1);
    }

    console.log(`📦 Using menu item: ${menuItem.name} (₹${menuItem.price})`);

    const testOrders = [
      {
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210'
        },
        orderItems: [{
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 2,
          subtotal: menuItem.price * 2,
          image: menuItem.image
        }],
        orderType: 'delivery',
        deliveryAddress: {
          street: '123 Main Street',
          apartment: 'Apt 4B',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          landmark: 'Near Park'
        },
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        pricing: {
          subtotal: menuItem.price * 2,
          deliveryFee: 30,
          tax: (menuItem.price * 2 * 0.05),
          discount: 0,
          total: menuItem.price * 2 + 30 + (menuItem.price * 2 * 0.05)
        },
        status: 'out-for-delivery',
        delivery: {
          type: 'standard',
          estimatedTime: new Date(Date.now() + 30 * 60 * 1000)
        }
      },
      {
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '9876543211'
        },
        orderItems: [{
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          subtotal: menuItem.price,
          image: menuItem.image
        }],
        orderType: 'takeaway',
        deliveryAddress: {
          street: '456 Oak Avenue',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411002'
        },
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        pricing: {
          subtotal: menuItem.price,
          deliveryFee: 0,
          tax: (menuItem.price * 0.05),
          discount: 0,
          total: menuItem.price + (menuItem.price * 0.05)
        },
        status: 'ready',
        delivery: {
          type: 'pickup',
          estimatedTime: new Date(Date.now() + 15 * 60 * 1000)
        }
      }
    ];

    await Order.insertMany(testOrders);

    console.log('✅ Test orders created successfully!');
    console.log('Orders created:');
    testOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.customer.name} - ₹${order.pricing.total} (${order.orderType})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test orders:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createTestOrders();