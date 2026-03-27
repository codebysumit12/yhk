import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    const User = await import('./models/User.js');
    
    try {
      // 1. Find the delivery partner
      const deliveryPartner = await User.default.findOne({ email: 'delivery@test.com' });
      console.log('✅ Delivery partner:', deliveryPartner.name, 'ID:', deliveryPartner._id);
      
      // 2. Check the existing order
      const existingOrder = await Order.default.findOne({ orderNumber: 'HK000045' });
      if (existingOrder) {
        console.log('\n🔍 Existing order details:');
        console.log('Order Number:', existingOrder.orderNumber);
        console.log('Status:', existingOrder.status);
        console.log('Delivery Person:', JSON.stringify(existingOrder.delivery?.deliveryPerson, null, 2));
        
        // 3. Update the order with proper delivery assignment if needed
        if (!existingOrder.delivery?.deliveryPerson?.id) {
          console.log('\n🔧 Updating order with delivery assignment...');
          existingOrder.delivery = {
            type: 'standard',
            deliveryPerson: {
              id: deliveryPartner._id,
              name: deliveryPartner.name,
              phone: deliveryPartner.phone,
              vehicleNumber: deliveryPartner.vehicleNumber
            },
            assignedAt: new Date(),
            otp: Math.floor(1000 + Math.random() * 9000).toString()
          };
          
          await existingOrder.save();
          console.log('✅ Order updated with delivery assignment');
          console.log('📱 Delivery OTP:', existingOrder.delivery.otp);
        }
        
        // 4. Test the query that DeliveryBoyApp uses
        console.log('\n🔍 Testing queries...');
        
        const query1 = await Order.default.find({ 
          'delivery.deliveryPerson.id': deliveryPartner._id 
        });
        console.log(`Query 1 (ObjectId): ${query1.length} orders found`);
        
        const query2 = await Order.default.find({ 
          'delivery.deliveryPerson.id': deliveryPartner._id.toString() 
        });
        console.log(`Query 2 (String): ${query2.length} orders found`);
        
        // 5. Show what the delivery boy should see
        console.log('\n📱 What DeliveryBoyApp should show:');
        if (query1.length > 0) {
          query1.forEach(order => {
            console.log(`- ${order.orderNumber}: ${order.status} (${order.customer.name})`);
          });
        } else if (query2.length > 0) {
          query2.forEach(order => {
            console.log(`- ${order.orderNumber}: ${order.status} (${order.customer.name})`);
          });
        } else {
          console.log('❌ No orders found - this is the problem!');
        }
        
        console.log('\n🔐 Login credentials for delivery boy:');
        console.log('Email: delivery@test.com');
        console.log('Password: password123');
        
      } else {
        console.log('❌ Order HK000045 not found');
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
