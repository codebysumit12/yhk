import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './project-root/backend/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function debugUserLogin() {
  try {
    await mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK');
    console.log('✅ Connected to MongoDB');

    const email = 'sumitkhekare@gmail.com';
    console.log(`\n🔍 Debugging login for: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ No user found with this email');
      
      // Create the user
      console.log('\n➕ Creating new user...');
      const hashedPassword = await bcrypt.hash('sumit123', 10);
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
      console.log('✅ User created successfully!');
      console.log('   Email: sumitkhekare@gmail.com');
      console.log('   Password: sumit123');
      
    } else {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   isActive:', user.isActive);
      console.log('   isEmailVerified:', user.isEmailVerified);
      console.log('   isPhoneVerified:', user.isPhoneVerified);
      console.log('   Has password:', !!user.password);
      
      // Test password comparison with common passwords
      const testPasswords = ['sumit123', 'password', '123456', 'sumitkhekare'];
      
      for (const testPass of testPasswords) {
        const match = await bcrypt.compare(testPass, user.password);
        if (match) {
          console.log(`   ✅ Password found: ${testPass}`);
          break;
        }
      }
    }

    // Show all users for reference
    console.log('\n📋 All users in database:');
    const allUsers = await User.find({}).select('email name role isActive');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) - ${u.role} - Active: ${u.isActive}`);
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugUserLogin();
