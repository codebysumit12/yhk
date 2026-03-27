import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './project-root/backend/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function debugLogin() {
  try {
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK');
    console.log('✅ Connected to MongoDB');

    const email = 'admin@yhk.com';
    const password = 'admin123';

    console.log(`\n🔍 Debugging login for: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ No user found with this email');
      
      // Try to find any admin users
      const adminUsers = await User.find({ role: 'admin' });
      console.log(`\n📋 Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name}) - isActive: ${u.isActive}`);
      });
    } else {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   isActive:', user.isActive);
      console.log('   isEmailVerified:', user.isEmailVerified);
      console.log('   isPhoneVerified:', user.isPhoneVerified);
      console.log('   Has password:', !!user.password);
      console.log('   Password hash:', user.password);
      console.log('   Hash starts with $2a$10$:', user.password?.startsWith('$2a$10$'));
      
      // Test password comparison
      const match = await bcrypt.compare(password, user.password);
      console.log('   Password match:', match ? '✅ YES' : '❌ NO');
      
      // Test if password is plain text
      const plainTextMatch = password === user.password;
      console.log('   Plain text match:', plainTextMatch ? '⚠️ YES (password not hashed)' : '✅ NO (properly hashed)');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugLogin();
