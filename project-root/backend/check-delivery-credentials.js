import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    // Find the delivery partner
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (!deliveryBoy) {
      console.log('Delivery partner not found');
      process.exit(1);
    }
    
    console.log('Delivery boy details:');
    console.log('Name:', deliveryBoy.name);
    console.log('Email:', deliveryBoy.email);
    console.log('Phone:', deliveryBoy.phone);
    console.log('Role:', deliveryBoy.role);
    console.log('Password hash:', deliveryBoy.password);
    
    // Test if password is the default one
    const testPasswords = ['password123', '123456', 'delivery', 'delivery123'];
    
    for (const testPwd of testPasswords) {
      const isMatch = await bcrypt.compare(testPwd, deliveryBoy.password);
      if (isMatch) {
        console.log(`\n✅ Found matching password: ${testPwd}`);
        break;
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
