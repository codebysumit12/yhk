const mongoose = require('mongoose');
const Order = require('./models/Order.js').default;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yhk-foodapp');
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

const testAssignDelivery = async () => {
  console.log('🧪 Testing delivery person assignment...\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Failed to connect to database');
    return;
  }

  try {
    // Find the latest order (most recent)
    const latestOrder = await Order.findOne({ 
      orderNumber: { $exists: true } 
    }).sort({ createdAt: -1 }).exec();
    
    if (!latestOrder) {
      console.log('❌ No orders found in database');
      return;
    }

    console.log(`📦 Found latest order: ${latestOrder.orderNumber}`);
    console.log(`📍 Current status: ${latestOrder.status}`);
    console.log(`📍 Current delivery:`, latestOrder.delivery);

    // Sample delivery person data
    const deliveryPerson = {
      id: '64f1a2b3c4d5e6f7a8b9c0d3e2f1',
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      vehicleNumber: 'MH-12-AB-1234',
      status: 'active'
    };

    // Update the order with delivery person assignment
    const updatedOrder = await Order.findByIdAndUpdate(
      latestOrder._id,
      {
        $set: {
          'delivery.deliveryPerson': deliveryPerson,
          'status': latestOrder.status === 'confirmed' ? 'preparing' : 'out-for-delivery',
          'timeline.$push': {
            status: latestOrder.status === 'confirmed' ? 'preparing' : 'out-for-delivery',
            timestamp: new Date(),
            message: `Delivery person ${deliveryPerson.name} assigned to order`
          }
        }
      },
      { new: true }
    );

    if (updatedOrder) {
      console.log('✅ Successfully assigned delivery person!');
      console.log(`🛵 Delivery person: ${deliveryPerson.name}`);
      console.log(`📱 Vehicle: ${deliveryPerson.vehicleNumber}`);
      console.log(`📞 Phone: ${deliveryPerson.phone}`);
      console.log(`🔄 Order status updated to: ${updatedOrder.status}`);
      
      console.log('\n📋 Updated Order Details:');
      console.log(`Order Number: ${updatedOrder.orderNumber}`);
      console.log(`Customer: ${updatedOrder.customer.name}`);
      console.log(`Delivery Address: ${updatedOrder.deliveryAddress.street}, ${updatedOrder.deliveryAddress.city}`);
      console.log(`Delivery Person: ${deliveryPerson.name} (${deliveryPerson.phone})`);
      console.log(`Status: ${updatedOrder.status}`);
      console.log(`Timeline Entries: ${updatedOrder.timeline.length}`);
      
    } else {
      console.log('❌ Failed to update order with delivery person');
    }

  } catch (error) {
    console.error('❌ Error in delivery assignment test:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testAssignDelivery().then(() => {
  console.log('\n🎯 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
