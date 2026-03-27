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
    
    console.log('Found delivery boy, setting password...');
    
    // Hash a default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('delivery123', salt);
    
    // Update the delivery boy with proper password
    await User.default.updateOne(
      { _id: deliveryBoy._id },
      { 
        $set: { 
          password: hashedPassword,
          isActive: true
        }
      }
    );
    
    console.log('Password set successfully for delivery boy');
    console.log('Login credentials:');
    console.log('Email: delivery34@gmail.com');
    console.log('Password: delivery123');
    console.log('Phone: 9370330486');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
