import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = 'mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK&retryWrites=true&w=majority';

const fixMenuData = async () => {
  try {
    console.log('🔧 Fixing menu data relationships...');
    
    await mongoose.connect(ATLAS_URI);
    const db = mongoose.connection.db;
    
    // Get all categories and items
    const categories = await db.collection('categories').find({}).toArray();
    const items = await db.collection('items').find({}).toArray();
    
    console.log(`Found ${categories.length} categories and ${items.length} items`);
    
    // Fix each item's categoryId to ensure it's a proper ObjectId string
    for (const item of items) {
      console.log(`\n🔍 Checking item: ${item.name}`);
      console.log(`   Current categoryId: ${item.categoryId} (${typeof item.categoryId})`);
      
      // Find matching category
      const matchingCategory = categories.find(cat => {
        // Try both string comparison and ObjectId comparison
        return cat._id.toString() === item.categoryId.toString() || 
               cat._id === item.categoryId;
      });
      
      if (matchingCategory) {
        console.log(`   ✅ Found match: ${matchingCategory.name}`);
        
        // Ensure categoryId is stored as string
        const updatedCategoryId = matchingCategory._id.toString();
        
        await db.collection('items').updateOne(
          { _id: item._id },
          { $set: { categoryId: updatedCategoryId } }
        );
        
        console.log(`   🔄 Updated categoryId to: ${updatedCategoryId}`);
      } else {
        console.log(`   ❌ No matching category found`);
        
        // Assign to first active category as fallback
        const firstActiveCategory = categories.find(cat => cat.isActive);
        if (firstActiveCategory) {
          console.log(`   🔄 Assigning to: ${firstActiveCategory.name}`);
          
          await db.collection('items').updateOne(
            { _id: item._id },
            { $set: { categoryId: firstActiveCategory._id.toString() } }
          );
        }
      }
    }
    
    // Verify the fix
    console.log('\n🔍 Verification:');
    const updatedItems = await db.collection('items').find({}).toArray();
    const updatedCategories = await db.collection('categories').find({}).toArray();
    
    updatedItems.forEach(item => {
      const matchingCategory = updatedCategories.find(cat => 
        cat._id.toString() === item.categoryId.toString()
      );
      if (matchingCategory) {
        console.log(`   ✅ ${item.name} → ${matchingCategory.name}`);
      } else {
        console.log(`   ❌ ${item.name} → STILL NO MATCH`);
      }
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
};

fixMenuData();
