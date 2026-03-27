import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    // Find the delivery partner
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (!deliveryBoy) {
      console.log('Delivery partner not found');
      process.exit(1);
    }
    
    console.log('Found delivery partner:', deliveryBoy.name);
    console.log('ID:', deliveryBoy._id);
    console.log('Role:', deliveryBoy.role);
    
    // Create a test token for this delivery boy
    const token = jwt.sign(
      { id: deliveryBoy._id },
      process.env.JWT_SECRET || 'yhk_secret_key_2024',
      { expiresIn: '1h' }
    );
    
    console.log('Test token generated:', token);
    
    // Simulate the API request
    try {
      const req = {
        user: {
          _id: deliveryBoy._id,
          id: deliveryBoy._id,
          role: deliveryBoy.role
        }
      };
      
      console.log('Simulated req.user:', req.user);
      
      // Test the query directly
      const deliveryBoyId = req.user._id || req.user.id;
      console.log('Delivery boy ID from request:', deliveryBoyId);
      
      let query = { 
        $or: [
          { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
          { 'delivery.deliveryPerson.id': deliveryBoyId }
        ]
      };
      
      console.log('Query:', JSON.stringify(query, null, 2));
      
      const orders = await Order.default.find(query)
        .sort({ createdAt: -1 })
        .populate('orderItems.menuItem', 'name images');
      
      console.log('Found orders:', orders.length);
      
      orders.forEach(order => {
        console.log(`- ${order.orderNumber}: ${order.status}`);
        console.log(`  Delivery Person ID: ${order.delivery?.deliveryPerson?.id}`);
        console.log(`  Match check: ${order.delivery?.deliveryPerson?.id?.toString() === deliveryBoyId.toString()}`);
      });
      
    } catch (error) {
      console.error('API simulation error:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
