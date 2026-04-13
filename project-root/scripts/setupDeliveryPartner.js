import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Setup delivery partner script
const setupDeliveryPartner = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if delivery partner already exists
    const existingDeliveryPartner = await User.findOne({ email: 'delivery@yhk.com' });
    
    if (existingDeliveryPartner) {
      console.log('Delivery partner already exists:', existingDeliveryPartner.email);
      if (existingDeliveryPartner.role !== 'delivery_partner') {
        console.log('Updating role to delivery_partner...');
        existingDeliveryPartner.role = 'delivery_partner';
        await existingDeliveryPartner.save();
        console.log('Role updated successfully');
      }
    } else {
      // Create a new delivery partner user
      const deliveryPartner = new User({
        name: 'Test Delivery Partner',
        email: 'delivery@yhk.com',
        phone: '9876543210',
        password: 'delivery123',
        role: 'delivery_partner',
        isActive: true,
        isVerified: true
      });
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      deliveryPartner.password = await bcrypt.hash('delivery123', salt);
      
      await deliveryPartner.save();
      console.log('Created new delivery partner:', deliveryPartner.email);
    }
    
    // Verify the delivery partner was created/updated
    const verifyDeliveryPartner = await User.findOne({ email: 'delivery@yhk.com' });
    console.log('Delivery partner details:');
    console.log('- Email:', verifyDeliveryPartner.email);
    console.log('- Name:', verifyDeliveryPartner.name);
    console.log('- Role:', verifyDeliveryPartner.role);
    console.log('- Phone:', verifyDeliveryPartner.phone);
    console.log('- Active:', verifyDeliveryPartner.isActive);
    console.log('- Verified:', verifyDeliveryPartner.isVerified);
    
    console.log('Delivery partner setup completed successfully');
    
  } catch (error) {
    console.error('Error setting up delivery partner:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
setupDeliveryPartner();
