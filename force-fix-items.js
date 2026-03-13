import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = 'mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK&retryWrites=true&w=majority';

const forceFixItems = async () => {
  try {
    console.log('🔧 Force fixing items issue...');
    
    await mongoose.connect(ATLAS_URI);
    const db = mongoose.connection.db;
    
    // Get the Test Burger item
    const items = await db.collection('items').find({}).toArray();
    const testBurger = items.find(item => item.name === 'Test Burger');
    
    if (testBurger) {
      console.log(`🍔 Found Test Burger:`, {
        name: testBurger.name,
        categoryId: testBurger.categoryId,
        categoryIdType: typeof testBurger.categoryId
      });
      
      // Get Sweets category
      const sweetsCategory = await db.collection('categories').findOne({ name: 'Sweets' });
      
      if (sweetsCategory) {
        console.log(`🍰 Found Sweets category:`, {
          name: sweetsCategory.name,
          _id: sweetsCategory._id,
          _idType: typeof sweetsCategory._id
        });
        
        // Force update the item's categoryId to match Sweets category
        const sweetsIdString = sweetsCategory._id.toString();
        
        await db.collection('items').updateOne(
          { _id: testBurger._id },
          { $set: { categoryId: sweetsIdString } }
        );
        
        console.log(`✅ Updated Test Burger categoryId to: ${sweetsIdString}`);
        
        // Verify the fix
        const updatedItem = await db.collection('items').findOne({ _id: testBurger._id });
        console.log(`🔍 Verification:`, {
          name: updatedItem.name,
          categoryId: updatedItem.categoryId,
          matches: updatedItem.categoryId === sweetsIdString
        });
        
      } else {
        console.log('❌ Sweets category not found');
      }
    } else {
      console.log('❌ Test Burger not found');
    }
    
    // Also update all categories to have correct itemCount
    console.log('\n📊 Updating category itemCounts...');
    const allCategories = await db.collection('categories').find({}).toArray();
    const allItems = await db.collection('items').find({}).toArray();
    
    for (const category of allCategories) {
      const itemsInCategory = allItems.filter(item => 
        String(item.categoryId) === String(category._id)
      );
      
      await db.collection('categories').updateOne(
        { _id: category._id },
        { $set: { itemCount: itemsInCategory.length } }
      );
      
      console.log(`   ${category.name}: ${itemsInCategory.length} items`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Force fix completed!');
    
  } catch (error) {
    console.error('❌ Force fix failed:', error);
    process.exit(1);
  }
};

forceFixItems();
