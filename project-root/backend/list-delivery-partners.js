import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const User = await import('./models/User.js');
    
    // Find all delivery partners
    const deliveryPartners = await User.default.find({ role: 'delivery_partner' });
    
    console.log('Delivery partners in system:');
    deliveryPartners.forEach(partner => {
      console.log(`- Name: ${partner.name}`);
      console.log(`  Email: ${partner.email}`);
      console.log(`  Phone: ${partner.phone}`);
      console.log(`  ID: ${partner._id}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
