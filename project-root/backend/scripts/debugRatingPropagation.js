import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 Checking rating propagation mechanism...');
  
  // Find the specific order
  const order = await Order.findOne({ orderNumber: 'YHK000068' });
  
  if (order) {
    console.log('✅ Found order YHK000068');
    console.log('Rating:', order.rating);
    console.log('Order items:');
    order.orderItems.forEach((item, i) => {
      console.log(`  ${i+1}. MenuItem ID: ${item.menuItem}, Name: ${item.name}`);
    });
    
    // Check if the item exists and its current ratings
    const item = await Item.findById(order.orderItems[0].menuItem);
    if (item) {
      console.log('\n✅ Item found:', item.name);
      console.log('Current ratings:', item.ratings);
      
      // Manually test the aggregation query
      console.log('\n🔍 Testing aggregation query...');
      const aggregation = await Order.aggregate([
        {
          $match: {
            'orderItems.menuItem': { $eq: item._id },
            'rating.stars': { $gte: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalStars: { $sum: '$rating.stars' },
            ratingCount: { $sum: 1 }
          }
        }
      ]);
      
      console.log('Aggregation result:', aggregation);
      
      if (aggregation.length > 0) {
        const newCount = aggregation[0].ratingCount;
        const newAverage = parseFloat((aggregation[0].totalStars / newCount).toFixed(2));
        console.log(`Calculated: average=${newAverage}, count=${newCount}`);
        
        // Update the item manually
        await Item.findByIdAndUpdate(item._id, {
          'ratings.average': newAverage,
          'ratings.count': newCount
        });
        
        console.log('✅ Item ratings updated manually');
        
        // Verify the update
        const updatedItem = await Item.findById(item._id);
        console.log('Updated ratings:', updatedItem.ratings);
      } else {
        console.log('❌ No aggregation results found');
      }
    } else {
      console.log('❌ Item not found');
    }
  } else {
    console.log('❌ Order YHK000068 not found');
  }
  
  mongoose.disconnect();
}).catch(console.error);
