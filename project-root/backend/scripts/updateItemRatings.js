import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const updateItemRatings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all items that have been ordered
    const items = await Item.find({});
    console.log(`Found ${items.length} items`);

    for (const item of items) {
      // Find all delivered orders with ratings for this item
      const ratedOrders = await Order.find({
        'orderItems.menuItem': item._id,
        'rating.stars': { $exists: true, $ne: null },
        status: 'delivered'
      });

      if (ratedOrders.length > 0) {
        // Calculate new average rating
        const totalRatings = ratedOrders.reduce((sum, order) => sum + order.rating.stars, 0);
        const averageRating = totalRatings / ratedOrders.length;
        
        // Update item with new ratings
        await Item.findByIdAndUpdate(item._id, {
          'ratings.average': averageRating,
          'ratings.count': ratedOrders.length
        });

        console.log(`Updated item "${item.name}": ${ratedOrders.length} ratings, avg: ${averageRating.toFixed(2)}`);
      } else {
        console.log(`No ratings found for item "${item.name}"`);
      }
    }

    console.log('Rating update completed successfully');
  } catch (error) {
    console.error('Error updating ratings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateItemRatings();
