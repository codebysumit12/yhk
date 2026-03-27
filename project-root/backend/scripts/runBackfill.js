import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

// Copy of the backfill function for testing
const backfillItemRatings = async () => {
  try {
    console.log('🔄 Starting full item-ratings backfill...');

    // ── 1. Find every unique item ID that appears in any order ───────────────
    const distinctItems = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.menuItem' } },
      { $match: { _id: { $ne: null } } }
    ]);

    const itemIds = distinctItems.map(d => d._id); // already ObjectIds
    console.log(`📦 Found ${itemIds.length} unique items across all orders`);

    const results = [];

    for (const oid of itemIds) {
      try {
        // ── 2a. Aggregate ratings ────────────────────────────────────────────
        const ratingAgg = await Order.aggregate([
          {
            $match: {
              'orderItems.menuItem': { $eq: oid },
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

        // ── 2b. Aggregate soldCount ──────────────────────────────────────────
        const soldAgg = await Order.aggregate([
          {
            $match: {
              'orderItems.menuItem': { $eq: oid },
              status: { $nin: ['cancelled'] }
            }
          },
          { $unwind: '$orderItems' },
          { $match: { 'orderItems.menuItem': { $eq: oid } } },
          { $group: { _id: null, totalSold: { $sum: '$orderItems.quantity' } } }
        ]);

        const newSoldCount = soldAgg[0]?.totalSold ?? 0;

        // ── 2c. Persist ──────────────────────────────────────────────────────
        const updated = await Item.findByIdAndUpdate(
          oid,
          {
            $set: {
              'ratings.average': newAverage,
              'ratings.count':   newCount,
              soldCount:         newSoldCount
            }
          },
          { new: true, select: 'name ratings soldCount' }
        );

        if (updated) {
          results.push({
            itemId:    oid,
            name:      updated.name,
            average:   newAverage,
            count:     newCount,
            soldCount: newSoldCount
          });
          console.log(`✅ ${updated.name}: avg=${newAverage} count=${newCount} sold=${newSoldCount}`);
        } else {
          console.warn(`⚠️  No Item document found for id ${oid} — orphaned order row`);
        }
      } catch (itemErr) {
        console.error(`❌ Failed for item ${oid}:`, itemErr.message);
      }
    }

    console.log(`Backfill complete. Processed ${results.length} of ${itemIds.length} items.`);
    return results;
  } catch (error) {
    console.error('Backfill error:', error);
    throw error;
  }
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await backfillItemRatings();
  mongoose.disconnect();
}).catch(console.error);
