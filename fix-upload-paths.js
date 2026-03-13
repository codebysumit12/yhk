import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = 'mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK&retryWrites=true&w=majority';

const fixUploadPaths = async () => {
  try {
    console.log('🔧 Fixing upload paths in database...');
    
    await mongoose.connect(ATLAS_URI);
    const db = mongoose.connection.db;
    
    // Check banners for local upload paths
    const banners = await db.collection('banners').find({}).toArray();
    console.log(`\n🖼️ Checking ${banners.length} banners:`);
    
    for (const banner of banners) {
      console.log(`   ${banner.title}: ${banner.mediaUrl}`);
      
      // If mediaUrl starts with 'uploads/' or is a local path, update it
      if (banner.mediaUrl && (banner.mediaUrl.startsWith('uploads/') || banner.mediaUrl.startsWith('/'))) {
        console.log(`   ❌ Local path detected: ${banner.mediaUrl}`);
        
        // Update to a placeholder Cloudinary URL or remove the banner
        await db.collection('banners').updateOne(
          { _id: banner._id },
          { 
            $set: { 
              mediaUrl: 'https://res.cloudinary.com/dyq3mqury/image/upload/v1772450502/yhk-banners/l96pjqwydqfnvtcl9bsx.avif',
              cloudinaryId: 'yhk-banners/l96pjqwydqfnvtcl9bsx'
            }
          }
        );
        
        console.log(`   ✅ Updated to Cloudinary URL`);
      } else {
        console.log(`   ✅ Already using Cloudinary URL`);
      }
    }
    
    // Check categories for local imageUrls
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`\n📂 Checking ${categories.length} categories:`);
    
    for (const category of categories) {
      if (category.imageUrl) {
        console.log(`   ${category.name}: ${category.imageUrl}`);
        
        if (category.imageUrl.startsWith('uploads/') || category.imageUrl.startsWith('/')) {
          console.log(`   ❌ Local path detected: ${category.imageUrl}`);
          
          // Update to use icon instead or set to null
          await db.collection('categories').updateOne(
            { _id: category._id },
            { $set: { imageUrl: null } }
          );
          
          console.log(`   ✅ Removed local imageUrl, will use icon`);
        } else {
          console.log(`   ✅ Using Cloudinary URL or null`);
        }
      }
    }
    
    // Check items for local imageUrls
    const items = await db.collection('items').find({}).toArray();
    console.log(`\n🍽️ Checking ${items.length} items:`);
    
    for (const item of items) {
      if (item.imageUrl) {
        console.log(`   ${item.name}: ${item.imageUrl}`);
        
        if (item.imageUrl.startsWith('uploads/') || item.imageUrl.startsWith('/')) {
          console.log(`   ❌ Local path detected: ${item.imageUrl}`);
          
          // Update to null or placeholder
          await db.collection('items').updateOne(
            { _id: item._id },
            { $set: { imageUrl: null } }
          );
          
          console.log(`   ✅ Removed local imageUrl`);
        } else {
          console.log(`   ✅ Using Cloudinary URL or null`);
        }
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Upload paths fixed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
};

fixUploadPaths();
