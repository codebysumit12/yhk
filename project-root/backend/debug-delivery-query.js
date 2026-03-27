import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK')
  .then(async () => {
    const User = await import('./models/User.js');
    const Order = await import('./models/Order.js');
    
    console.log('=== DEBUGGING DELIVERY PRATAP ORDER QUERY ===');
    
    // 1. Get delivery pratap's exact ID
    const deliveryPratap = await User.default.findOne({ 
      email: 'deliverypratap@gmail.com' 
    });
    
    if (!deliveryPratap) {
      console.log('❌ Delivery pratap not found');
      process.exit(1);
    }
    
    console.log('✅ Delivery pratap found:');
    console.log('ID:', deliveryPratap._id.toString());
    console.log('ID (ObjectId):', deliveryPratap._id);
    
    // 2. Find the specific order YHK000057
    const order = await Order.default.findOne({ orderNumber: 'YHK000057' });
    
    if (!order) {
      console.log('❌ Order YHK000057 not found');
      process.exit(1);
    }
    
    console.log('\n✅ Order YHK000057 found:');
    console.log('Status:', order.status);
    console.log('Customer:', order.customer?.name);
    console.log('Delivery Person:', order.delivery?.deliveryPerson?.name);
    console.log('Delivery Person ID:', order.delivery?.deliveryPerson?.id);
    console.log('Delivery Person ID type:', typeof order.delivery?.deliveryPerson?.id);
    
    // 3. Test the exact query that getMyDeliveries uses
    console.log('\n=== TESTING API QUERY ===');
    
    const deliveryBoyId = deliveryPratap._id;
    console.log('Querying with deliveryBoyId:', deliveryBoyId.toString());
    console.log('Querying with deliveryBoyId (ObjectId):', deliveryBoyId);
    
    // Test both string and ObjectId formats
    const query = { 
      $or: [
        { 'delivery.deliveryPerson.id': deliveryBoyId.toString() },
        { 'delivery.deliveryPerson.id': deliveryBoyId }
      ]
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const foundOrders = await Order.default.find(query);
    console.log('Orders found by query:', foundOrders.length);
    
    foundOrders.forEach(o => {
      console.log(`- ${o.orderNumber}: ${o.status}`);
    });
    
    // 4. Check if the delivery person ID matches exactly
    const storedId = order.delivery?.deliveryPerson?.id;
    const expectedId = deliveryPratap._id.toString();
    
    console.log('\n=== ID COMPARISON ===');
    console.log('Stored ID:', storedId);
    console.log('Expected ID:', expectedId);
    console.log('Types match:', typeof storedId === typeof expectedId);
    console.log('Values match:', storedId === expectedId);
    
    // Convert both to string for comparison
    const storedIdStr = storedId?.toString();
    const expectedIdStr = deliveryPratap._id.toString();
    console.log('String comparison:', storedIdStr === expectedIdStr);
    
    if (storedIdStr !== expectedIdStr) {
      console.log('\n❌ ID MISMATCH DETECTED!');
      console.log('Fixing the delivery person ID in the order...');
      
      // Fix the order
      await Order.default.updateOne(
        { _id: order._id },
        { 
          $set: { 
            'delivery.deliveryPerson.id': deliveryPratap._id.toString()
          }
        }
      );
      
      console.log('✅ Order updated with correct delivery person ID');
      
      // Test again
      const updatedOrders = await Order.default.find(query);
      console.log('Orders found after fix:', updatedOrders.length);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
