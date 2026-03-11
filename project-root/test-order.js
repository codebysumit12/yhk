import mongoose from 'mongoose';
import Order from './backend/models/Order.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yhk-restaurant')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create a test order
const createTestOrder = async () => {
  try {
    const testOrder = new Order({
      orderNumber: "YHK000001",
      customer: {
        name: "John Doe",
        email: "john@example.com", 
        phone: "9876543210"
      },
      orderItems: [{
        menuItem: "69aeb074400dca9c7487ff90",
        name: "Test Item",
        price: 254,
        quantity: 2,
        subtotal: 508
      }],
      orderType: "delivery",
      deliveryAddress: {
        street: "123 Main Street",
        city: "Pune",
        state: "Maharashtra",
        zipCode: "411001"
      },
      paymentMethod: "online",
      pricing: {
        subtotal: 508,
        deliveryFee: 30,
        tax: 25.4,
        discount: 0,
        total: 563.4
      },
      delivery: {
        type: "standard",
        estimatedTime: new Date(Date.now() + 45 * 60 * 1000)
      },
      specialInstructions: "Please deliver at the gate"
    });

    const savedOrder = await testOrder.save();
    console.log('Test order created successfully:', savedOrder);
    console.log('Order Number:', savedOrder.orderNumber);
    
    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test order:', error);
    mongoose.connection.close();
  }
};

createTestOrder();
