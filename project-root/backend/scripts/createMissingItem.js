import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Create the missing item
  const newItem = await Item.create({
    name: 'Healthy Veg Bowl',
    slug: 'healthy-veg-bowl',
    description: 'A nutritious bowl packed with fresh vegetables',
    price: 299,
    discountPrice: 249,
    categoryId: null,
    images: [],
    type: 'veg',
    spiceLevel: 'mild',
    ingredients: ['vegetables', 'rice', 'sauce'],
    allergens: ['gluten'],
    tags: ['healthy', 'vegetarian'],
    isAvailable: true,
    isFeatured: false,
    isPopular: false,
    displayOrder: 0,
    nutritionInfo: {
      calories: 350,
      protein: 12,
      carbs: 45,
      fat: 8,
      fiber: 6,
      sodium: 600
    },
    ratings: {
      average: 0,
      count: 0
    },
    soldCount: 0,
    calories: 350,
    preparationTime: 15,
    servingSize: '1 bowl'
  });
  
  console.log('Created item:', newItem.name, 'ID:', newItem._id);
  
  // Now run backfill again
  console.log('Running backfill...');
  
  // Find orders with this item and ratings
  const Order = mongoose.model('Order');
  const ratingAgg = await Order.aggregate([
    {
      $match: {
        'orderItems.menuItem': { $eq: newItem._id },
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

  const newCount   = ratingAgg[0]?.ratingCount ?? 0;
  const newAverage = newCount > 0
    ? parseFloat((ratingAgg[0].totalStars / newCount).toFixed(2))
    : 0;

  // Update the item
  await Item.findByIdAndUpdate(newItem._id, {
    'ratings.average': newAverage,
    'ratings.count': newCount
  });

  console.log(`Updated item ratings: avg=${newAverage}, count=${newCount}`);
  
  mongoose.disconnect();
}).catch(console.error);
