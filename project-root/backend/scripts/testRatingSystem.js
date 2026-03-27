import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find a delivered order and add a rating to test the system
  const deliveredOrder = await Order.findOne({ status: 'delivered' });
  
  if (deliveredOrder) {
    console.log('Testing rating update for order:', deliveredOrder.orderNumber);
    
    // Add a test rating
    deliveredOrder.rating = {
      stars: 4,
      comment: 'Test rating for system verification',
      ratedAt: new Date()
    };
    
    await deliveredOrder.save();
    console.log('Rating added successfully');
    
    // Check if item ratings were updated
    const Item = mongoose.model('Item');
    for (const orderItem of deliveredOrder.orderItems) {
      const item = await Item.findById(orderItem.menuItem);
      if (item) {
        console.log(`Item "${item.name}": Rating=${item.ratings.average}, Count=${item.ratings.count}`);
      }
    }
  } else {
    console.log('No delivered orders found to test with');
  }
  
  mongoose.disconnect();
}).catch(console.error);
