import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './project-root/backend/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function resetUserPassword() {
  try {
    // Connect with increased timeout
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK', options);
    console.log('✅ Connected to MongoDB');

    const email = 'sumitkhekare@gmail.com';
    const newPassword = 'sumit123';
    
    console.log(`\n🔧 Resetting password for: ${email}`);
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ No user found with this email');
      
      // Create the user
      console.log('\n➕ Creating new user instead...');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const newUser = new User({
        name: 'Sumit Khekare',
        email: email,
        password: hashedPassword,
        phone: '+919876543210',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      });

      await newUser.save();
      console.log('✅ New user created successfully!');
    } else {
      console.log('✅ User found, updating password...');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.isActive = true;
      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      
      await user.save();
      console.log('✅ Password updated successfully!');
    }
    
    console.log('\n🎉 Your login credentials are now:');
    console.log('   📧 Email: sumitkhekare@gmail.com');
    console.log('   🔒 Password: sumit123');
    console.log('\n✨ You can now login to explore delicious meals!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

resetUserPassword();
