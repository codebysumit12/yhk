import mongoose from 'mongoose';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Check item ratings before backfill
  const items = await Item.find({}).select('name ratings');
  console.log('Item ratings before backfill:');
  items.forEach(item => {
    console.log(`${item.name}: avg=${item.ratings.average}, count=${item.ratings.count}`);
  });
  
  mongoose.disconnect();
}).catch(console.error);
