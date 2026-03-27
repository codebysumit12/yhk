import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find the specific order you mentioned
  const order = await Order.findOne({orderNumber: 'YHK000052'});
  
  if (order) {
    console.log('Found order YHK000052');
    console.log('Rating:', order.rating);
    console.log('Order items:');
    order.orderItems.forEach(item => {
      console.log(`  MenuItem ID: ${item.menuItem}, Name: ${item.name}`);
    });
    
    // Check if the item exists
    const item = await Item.findById('69c0ddb502811983d1005fc0');
    if (item) {
      console.log('\nItem exists:', item.name);
      console.log('Current ratings:', item.ratings);
      
      // Check if this item is in the order
      const itemInOrder = order.orderItems.find(oi => 
        oi.menuItem.toString() === item._id.toString()
      );
      console.log('Item found in order:', !!itemInOrder);
      
      if (itemInOrder) {
        console.log('Running manual rating update...');
        
        // Manually update the item rating
        await Item.findByIdAndUpdate(item._id, {
          'ratings.average': 1,
          'ratings.count': 1
        });
        
        console.log('Item ratings updated manually');
      }
    } else {
      console.log('Item not found');
    }
  } else {
    console.log('Order YHK000052 not found');
  }
  
  mongoose.disconnect();
}).catch(console.error);
