import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 CHECKING ACTIVE CATEGORY ISSUE');
  console.log('==================================');
  
  const db = mongoose.connection.db;
  const categoriesCollection = db.collection('categories');
  
  // Check what the active category ID is
  console.log('\n🎯 Active Category ID: 69c02026ade712947c4b700e');
  
  // Check if this category exists
  const activeCategory = await categoriesCollection.findOne({ _id: '69c02026ade712947c4b700e' });
  
  if (activeCategory) {
    console.log('✅ Category exists:', activeCategory.name);
  } else {
    console.log('❌ Category does NOT exist!');
    
    // Show all available categories
    const allCategories = await categoriesCollection.find({}).toArray();
    console.log('\n📋 Available categories:');
    allCategories.forEach((cat, i) => {
      console.log(`  ${i+1}. "${cat.name}" (ID: ${cat._id})`);
    });
    
    // Find the correct category IDs that should work
    console.log('\n🔧 These category IDs should work:');
    const validCategories = allCategories.filter(cat => 
      ['Main Course', 'Beverages', 'Appetizers'].includes(cat.name)
    );
    
    validCategories.forEach(cat => {
      console.log(`  ${cat.name}: ${cat._id}`);
    });
  }
  
  mongoose.disconnect();
}).catch(console.error);
