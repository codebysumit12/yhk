import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔧 CREATING MISSING MAIN COURSE CATEGORY');
  console.log('========================================');
  
  const db = mongoose.connection.db;
  const categoriesCollection = db.collection('categories');
  
  // Check if "Main Course" category already exists
  const existingMainCourse = await categoriesCollection.findOne({ name: 'Main Course' });
  
  if (existingMainCourse) {
    console.log('✅ Main Course category already exists:', existingMainCourse._id);
  } else {
    // Create the Main Course category
    const newCategory = {
      name: 'Main Course',
      slug: 'main-course',
      description: 'Main course dishes and meals',
      image: '',
      isActive: true,
      itemCount: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await categoriesCollection.insertOne(newCategory);
    console.log('✅ Created Main Course category with ID:', result.insertedId);
    
    // Update the frontend categoryMap with the new ID
    console.log('\n🔧 Update your frontend categoryMap to:');
    console.log(`{
      'main_course': '${result.insertedId}',
      'beverage': '69b13b978ffe7b66b415b8c5',
      'appetizer': '69b13b978ffe7b66b415b8c6'
    }`);
  }
  
  mongoose.disconnect();
}).catch(console.error);
