import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const items = await Item.find({}).select('name ratings');
  console.log('📊 Current item ratings:');
  items.forEach(item => {
    if (item.ratings.count > 0) {
      console.log(`⭐ ${item.name}: avg=${item.ratings.average}, count=${item.ratings.count}`);
    }
  });
  mongoose.disconnect();
}).catch(console.error);
