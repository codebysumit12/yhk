import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🚀 Fast rating fix starting...');
  
  // Find all orders with ratings
  const ratedOrders = await Order.find({'rating.stars': { $exists: true, $ne: null }});
  console.log(`Found ${ratedOrders.length} rated orders`);
  
  for (const order of ratedOrders) {
    console.log(`Processing order ${order.orderNumber} - ${order.rating.stars} stars`);
    
    for (const orderItem of order.orderItems) {
      try {
        // Find all ratings for this item
        const aggregation = await Order.aggregate([
          {
            $match: {
              'orderItems.menuItem': { $eq: orderItem.menuItem },
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

        if (aggregation.length > 0) {
          const newCount = aggregation[0].ratingCount;
          const newAverage = parseFloat((aggregation[0].totalStars / newCount).toFixed(2));
          
          // Update item
          await Item.findByIdAndUpdate(orderItem.menuItem, {
            'ratings.average': newAverage,
            'ratings.count': newCount
          });
          
          console.log(`✅ Updated item ${orderItem.name}: avg=${newAverage}, count=${newCount}`);
        }
      } catch (err) {
        console.log(`❌ Failed for item ${orderItem.menuItem}: ${err.message}`);
      }
    }
  }
  
  console.log('🎉 Fast rating fix completed!');
  mongoose.disconnect();
}).catch(console.error);
