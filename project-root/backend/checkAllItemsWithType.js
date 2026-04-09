import mongoose from 'mongoose';
import MenuItem from './models/MenuItem.js';
import connectDB from './config/db.js';

connectDB().then(async () => {
  const allItems = await MenuItem.find({});
  console.log(`Total items in database: ${allItems.length}`);
  
  const smoothieItems = allItems.filter(item => item.type === 'smoothies');
  const dessertItems = allItems.filter(item => item.type === 'desserts');
  
  console.log(`\nItems with type 'smoothies': ${smoothieItems.length}`);
  smoothieItems.forEach(item => {
    console.log(`- ${item.name} (ID: ${item._id})`);
  });
  
  console.log(`\nItems with type 'desserts': ${dessertItems.length}`);
  dessertItems.forEach(item => {
    console.log(`- ${item.name} (ID: ${item._id})`);
  });
  
  await mongoose.disconnect();
}).catch(console.error);
