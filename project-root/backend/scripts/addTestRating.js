import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

// First, let's create a test rated order
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find a delivered order
  const deliveredOrder = await Order.findOne({ status: 'delivered' });
  
  if (deliveredOrder && !deliveredOrder.rating?.stars) {
    console.log('Adding test rating to order:', deliveredOrder.orderNumber);
    
    // Add the rating you mentioned (1 star)
    deliveredOrder.rating = {
      stars: 1,
      comment: 'Test rating from user',
      ratedAt: new Date()
    };
    
    await deliveredOrder.save();
    console.log('Rating added successfully');
  } else {
    console.log('No delivered order found or already rated');
  }
  
  mongoose.disconnect();
}).catch(console.error);
