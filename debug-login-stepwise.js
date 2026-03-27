import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './project-root/backend/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function debugLoginStepwise() {
  try {
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK');
    console.log('✅ Connected to MongoDB');

    const email = 'sumitkhekare@gmail.com';
    const password = 'sumit123';
    
    console.log(`\n🔍 Debugging login for: ${email}`);
    
    // Step 1: Find user
    const user = await User.findOne({ email }).select('+password');
    console.log('Step 1 - User found:', !!user);

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log('User details:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  isActive:', user.isActive);
    console.log('  Has password:', !!user.password);
    console.log('  Password hash length:', user.password?.length || 0);

    // Step 2: Test password comparison
    console.log('\nStep 2 - Testing password comparison...');
    
    // Test with bcrypt.compare directly
    const directCompare = await bcrypt.compare(password, user.password);
    console.log('Direct bcrypt.compare result:', directCompare);

    // Test with matchPassword method
    const methodCompare = await user.matchPassword(password);
    console.log('matchPassword method result:', methodCompare);

    // Step 3: Test if password is plain text
    const plainTextMatch = password === user.password;
    console.log('Plain text match:', plainTextMatch);

    // Step 4: Test creating new hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash matches old hash:', newHash === user.password);

    // Step 5: If all fails, update password
    if (!directCompare && !methodCompare) {
      console.log('\n🔧 Updating password...');
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
      
      // Test again
      const updatedUser = await User.findOne({ email }).select('+password');
      const updatedCompare = await updatedUser.matchPassword(password);
      console.log('Updated password test:', updatedCompare);
      
      if (updatedCompare) {
        console.log('✅ Password updated successfully!');
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugLoginStepwise();
