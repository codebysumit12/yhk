import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk')
  .then(async () => {
    const Order = await import('./models/Order.js');
    const User = await import('./models/User.js');
    const MenuItem = await import('./models/MenuItem.js');
    
    try {
      // 1. Find or create a delivery partner
      let deliveryPartner = await User.default.findOne({ email: 'delivery@test.com' });
      
      if (!deliveryPartner) {
        deliveryPartner = new User.default({
          name: 'Test Delivery Boy',
          email: 'delivery@test.com',
          phone: '9876543210',
          role: 'delivery_partner',
          password: await bcrypt.hash('password123', 10),
          vehicleNumber: 'DL-01-AB-1234',
          isActive: true
        });
        
        await deliveryPartner.save();
        console.log('✅ Delivery partner created:', deliveryPartner.name, 'ID:', deliveryPartner._id);
      } else {
        console.log('✅ Using existing delivery partner:', deliveryPartner.name, 'ID:', deliveryPartner._id);
      }
      
      // 2. Check for existing menu items or create dummy ones
      let menuItems = await MenuItem.default.find({});
      
      if (menuItems.length === 0) {
        // Create dummy menu items for testing
        const item1 = new MenuItem.default({
          name: 'Test Item 1',
          price: 15.00,
          category: 'Test Category',
          description: 'Test description',
          available: true
        });
        
        const item2 = new MenuItem.default({
          name: 'Test Item 2',
          price: 1.05,
          category: 'Test Category',
          description: 'Test description',
          available: true
        });
        
        await item1.save();
        await item2.save();
        menuItems = [item1, item2];
        console.log('✅ Created dummy menu items');
      }
      
      // 3. Create a test order
      const orderItems = [
        {
          menuItem: menuItems[0]._id,
          name: menuItems[0].name,
          quantity: 2,
          price: menuItems[0].price,
          subtotal: 2 * menuItems[0].price
        },
        {
          menuItem: menuItems[1]?._id || menuItems[0]._id,
          name: menuItems[1]?.name || menuItems[0].name,
          quantity: 1,
          price: menuItems[1]?.price || menuItems[0].price,
          subtotal: menuItems[1]?.price || menuItems[0].price
        }
      ];
      
      const testOrder = new Order.default({
        orderNumber: 'HK000045',
        customer: {
          name: 'Test Customer',
          phone: '9370337263',
          email: 'customer@test.com'
        },
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Pune',
          landmark: 'Near Test Mall',
          zipCode: '411001'
        },
        orderItems: orderItems,
        orderType: 'delivery',
        pricing: {
          subtotal: orderItems.reduce((sum, item) => sum + item.subtotal, 0),
          deliveryFee: 0,
          tax: 0,
          discount: 0,
          total: orderItems.reduce((sum, item) => sum + item.subtotal, 0)
        },
        paymentMethod: 'online',
        paymentStatus: 'paid',
        status: 'out-for-delivery',
        specialInstructions: 'Test delivery instructions',
        delivery: {
          type: 'standard',
          deliveryPerson: {
            id: deliveryPartner._id,
            name: deliveryPartner.name,
            phone: deliveryPartner.phone,
            vehicleNumber: deliveryPartner.vehicleNumber
          },
          assignedAt: new Date(),
          otp: Math.floor(1000 + Math.random() * 9000).toString() // Generate 4-digit OTP
        }
      });
      
      await testOrder.save();
      console.log('✅ Test order created:', testOrder.orderNumber);
      console.log('📱 Delivery OTP:', testOrder.delivery.otp);
      console.log('🚚 Assigned to:', deliveryPartner.name);
      
      // 4. Verify the setup - check the actual order
      const createdOrder = await Order.default.findOne({ orderNumber: 'HK000045' });
      console.log('\n🔍 Created order details:');
      console.log('Order Number:', createdOrder.orderNumber);
      console.log('Status:', createdOrder.status);
      console.log('Delivery Person:', JSON.stringify(createdOrder.delivery?.deliveryPerson, null, 2));
      
      // Try different query formats
      const query1 = await Order.default.find({ 
        'delivery.deliveryPerson.id': deliveryPartner._id 
      });
      console.log(`\n📋 Query 1 (delivery.deliveryPerson.id): ${query1.length} orders`);
      
      const query2 = await Order.default.find({ 
        'delivery.deliveryPerson.id': deliveryPartner._id.toString() 
      });
      console.log(`📋 Query 2 (delivery.deliveryPerson.id as string): ${query2.length} orders`);
      
      console.log('\n🔐 Login credentials for delivery boy:');
      console.log('Email: delivery@test.com');
      console.log('Password: password123');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
