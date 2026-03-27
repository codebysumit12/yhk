import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    // Find and update the delivery partner
    const deliveryBoy = await User.default.findOne({ phone: '9370330486' });
    if (!deliveryBoy) {
      console.log('Delivery partner not found');
      process.exit(1);
    }
    
    console.log('Found delivery boy, updating password...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('delivery123', 10);
    
    // Update using the document directly
    deliveryBoy.password = hashedPassword;
    deliveryBoy.isActive = true;
    
    await deliveryBoy.save();
    
    console.log('✅ Password updated successfully!');
    console.log('Login credentials:');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    
    // Verify the update
    const updatedUser = await User.default.findOne({ phone: '9370330486' });
    console.log('Password hash exists:', !!updatedUser.password);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
