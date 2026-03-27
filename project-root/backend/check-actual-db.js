import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

console.log('=== CHECKING ACTUAL DATABASE CONNECTION ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    console.log('✅ Connected to database');
    
    const User = await import('./models/User.js');
    
    // 1. Check if delivery boy exists
    const deliveryBoy = await User.default.findOne({ email: 'delivery34@gmail.com' }).select('+password');
    
    if (!deliveryBoy) {
      console.log('❌ Delivery boy not found in database');
      console.log('Creating delivery boy...');
      
      const hashedPassword = await bcrypt.hash('delivery123', 10);
      
      const newDeliveryBoy = new User.default({
        name: 'dffd iuui',
        email: 'delivery34@gmail.com',
        phone: '9370330486',
        password: hashedPassword,
        role: 'delivery_partner',
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        preferences: {},
        addresses: []
      });
      
      await newDeliveryBoy.save();
      console.log('✅ Delivery boy created with password: delivery123');
      
    } else {
      console.log('✅ Found delivery boy:', deliveryBoy.name);
      console.log('Role:', deliveryBoy.role);
      console.log('Active:', deliveryBoy.isActive);
      console.log('Password exists:', !!deliveryBoy.password);
      
      // 2. Test the password
      const testResult = await bcrypt.compare('delivery123', deliveryBoy.password);
      console.log('Password "delivery123" match:', testResult);
      
      if (!testResult) {
        console.log('❌ Password mismatch, resetting...');
        const newHash = await bcrypt.hash('delivery123', 10);
        await User.default.updateOne(
          { _id: deliveryBoy._id },
          { $set: { password: newHash, isActive: true } }
        );
        console.log('✅ Password reset to: delivery123');
      }
    }
    
    // 3. List all users to see what's in the database
    console.log('\n=== ALL USERS IN DATABASE ===');
    const allUsers = await User.default.find({}).select('name email role phone isActive');
    console.log('Total users:', allUsers.length);
    
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
    });
    
    console.log('\n=== LOGIN TEST INSTRUCTIONS ===');
    console.log('Try login with:');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
