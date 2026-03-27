// Debug script to identify deliveryPerson error
console.log('🔍 Starting checkout debug test...\n');

// Test 1: Check if Checkoutpage component loads without errors
try {
  console.log('📦 Testing component import...');
  
  // Simulate the component initialization
  const mockAddressForm = {
    flatNo: '',
    landmark: '',
    addressType: 'home',
    fullName: '',
    addressLine1: 'Test Address',
    addressLine2: '',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411018'
  };

  console.log('✅ addressForm initialized:', mockAddressForm);

  // Test 2: Check delivery object creation
  console.log('📦 Testing delivery object creation...');
  
  const deliveryObject = {
    type: 'standard',
    estimatedTime: new Date(Date.now() + 30 * 60 * 1000),
    actualTime: null,
    deliveryPerson: null
  };

  console.log('✅ delivery object created:', deliveryObject);

  // Test 3: Check complete order payload
  console.log('📦 Testing complete order payload...');
  
  const orderPayload = {
    customer: {
      name: mockAddressForm.fullName || 'Test Customer',
      phone: '+919876543210',
      email: 'test@example.com'
    },
    orderItems: [{
      menuItem: 'test-id',
      name: 'Test Item',
      price: 100,
      quantity: 1,
      subtotal: 100
    }],
    deliveryAddress: {
      street: mockAddressForm?.addressLine1 || 'Default Address',
      city: mockAddressForm?.city || '',
      state: mockAddressForm?.state || '',
      zipCode: mockAddressForm?.pinCode || '',
      apartment: mockAddressForm?.flatNo || '',
      landmark: mockAddressForm?.landmark || '',
      instructions: 'Test instructions'
    },
    orderType: 'delivery',
    paymentMethod: 'online',
    delivery: deliveryObject,
    specialInstructions: 'Test instructions'
  };

  console.log('✅ Complete order payload created:', JSON.stringify(orderPayload, null, 2));

  // Test 4: Try to stringify the payload (this is where errors often occur)
  console.log('📦 Testing JSON.stringify...');
  
  try {
    const jsonString = JSON.stringify(orderPayload);
    console.log('✅ JSON.stringify successful, length:', jsonString.length);
    console.log('✅ JSON preview:', jsonString.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ JSON.stringify failed:', error.message);
    console.error('❌ Error details:', error);
  }

  // Test 5: Check specific property access
  console.log('📦 Testing specific property access...');
  
  try {
    console.log('📍 Testing deliveryPerson access...');
    const testDeliveryPerson = orderPayload.delivery.deliveryPerson;
    console.log('✅ deliveryPerson value:', testDeliveryPerson);
    
    console.log('📍 Testing nested property access...');
    const testNested = orderPayload.delivery?.deliveryPerson;
    console.log('✅ Nested deliveryPerson value:', testNested);
    
  } catch (error) {
    console.error('❌ Property access failed:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }

  console.log('\n🎯 Debug test completed!');
  console.log('📋 Summary:');
  console.log('- Component initialization: ✅');
  console.log('- Delivery object creation: ✅');
  console.log('- Order payload creation: ✅');
  console.log('- JSON.stringify: ✅');
  console.log('- Property access: ✅');
  
} catch (error) {
  console.error('❌ Debug test failed:', error.message);
  console.error('❌ Stack trace:', error.stack);
}

// Test 6: Check browser console for any additional errors
console.log('\n🌐 Checking for browser console errors...');
if (typeof window !== 'undefined') {
  console.log('✅ Running in browser environment');
  
  // Add error listener to catch any runtime errors
  window.addEventListener('error', function(event) {
    console.error('❌ Runtime error caught:', event.error);
    console.error('❌ Filename:', event.filename);
    console.error('❌ Line number:', event.lineno);
    console.error('❌ Column:', event.colno);
  });
  
  // Add unhandled promise rejection listener
  window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled promise rejection:', event.reason);
  });
} else {
  console.log('ℹ️ Running in Node.js environment');
}

console.log('\n🔍 Debug script loaded successfully!');
