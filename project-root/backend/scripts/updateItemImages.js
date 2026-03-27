import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔧 UPDATING ITEM IMAGES TO REAL URLs');
  console.log('===================================');
  
  const db = mongoose.connection.db;
  const menuItemsCollection = db.collection('menuitems');
  
  // Update items with real image URLs
  const updates = [
    {
      name: 'Green Salad',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center'
    },
    {
      name: 'Fresh Fruit Smoothie', 
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&h=200&fit=crop&crop=center'
    },
    {
      name: 'Healthy Veg Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&crop=center'
    }
  ];
  
  for (const update of updates) {
    const result = await menuItemsCollection.updateOne(
      { name: update.name },
      { $set: { image: update.image } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Updated image for ${update.name}`);
    } else {
      console.log(`❌ Could not update ${update.name}`);
    }
  }
  
  console.log('\n✅ Image updates completed!');
  
  mongoose.disconnect();
}).catch(console.error);
