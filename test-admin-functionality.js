import fetch from 'node-fetch';

const API_URL = 'http://localhost:5001/api';

async function testAdminFunctionality() {
  console.log('🧪 Starting comprehensive admin functionality test...\n');

  // Test 1: Admin Login
  console.log('🔐 Test 1: Admin Login');
  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    console.log('Login success:', loginData.success);

    if (loginData.success && loginData.data.token) {
      const token = loginData.data.token;
      console.log('✅ Admin login successful, token received');

      // Test 2: Orders API
      console.log('\n📋 Test 2: Orders API');
      try {
        const ordersResponse = await fetch(`${API_URL}/orders`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const ordersData = await ordersResponse.json();
        console.log('Orders status:', ordersResponse.status);
        console.log('Orders success:', ordersData.success);
        console.log('Orders count:', ordersData.data?.length || 0);
      } catch (error) {
        console.log('❌ Orders API failed:', error.message);
      }

      // Test 3: Items API
      console.log('\n🍽 Test 3: Items API');
      try {
        const itemsResponse = await fetch(`${API_URL}/items`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const itemsData = await itemsResponse.json();
        console.log('Items status:', itemsResponse.status);
        console.log('Items success:', itemsData.success);
        console.log('Items count:', itemsData.data?.length || 0);
      } catch (error) {
        console.log('❌ Items API failed:', error.message);
      }

      // Test 4: Categories API
      console.log('\n📁 Test 4: Categories API');
      try {
        const categoriesResponse = await fetch(`${API_URL}/categories?isActive=true`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const categoriesData = await categoriesResponse.json();
        console.log('Categories status:', categoriesResponse.status);
        console.log('Categories success:', categoriesData.success);
        console.log('Categories count:', categoriesData.data?.length || 0);
      } catch (error) {
        console.log('❌ Categories API failed:', error.message);
      }

      // Test 5: Create Item (simulate form submission)
      console.log('\n➕ Test 5: Create Item API');
      try {
        const createItemResponse = await fetch(`${API_URL}/items`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: 'Test Item',
            description: 'Test description',
            price: 99,
            category: 'test-category-id',
            type: 'veg',
            isAvailable: true
          })
        });

        const createData = await createItemResponse.json();
        console.log('Create Item status:', createItemResponse.status);
        console.log('Create Item success:', createData.success);
      } catch (error) {
        console.log('❌ Create Item API failed:', error.message);
      }

    } else {
      console.log('❌ Admin login failed');
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }

  console.log('\n🏁 Admin functionality test completed!');
}

// Run the test
testAdminFunctionality();
