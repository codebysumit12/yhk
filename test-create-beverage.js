import fetch from 'node-fetch';
import FormData from 'form-data';

const API_URL = 'http://localhost:50017/api';

async function createTestBeverage() {
  try {
    // Get admin token
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Logged in successfully');

    // Create test beverage
    const formData = new FormData();
    formData.append('name', 'Test Fresh Orange Juice');
    formData.append('description', 'Freshly squeezed orange juice with pulp');
    formData.append('price', '89');
    formData.append('type', 'drinks');
    formData.append('isAvailable', 'true');
    formData.append('isFeatured', 'false');
    formData.append('preparationTime', '3');
    formData.append('servingSize', '300ml');
    formData.append('calories', '120');
    formData.append('ingredients', JSON.stringify(['Fresh Oranges', 'Ice', 'Sugar']));
    formData.append('allergens', JSON.stringify([]));

    const createResponse = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Test beverage created successfully!');
      console.log('📝 Item details:', {
        id: createData.data._id,
        name: createData.data.name,
        type: createData.data.type,
        categoryId: createData.data.categoryId
      });
    } else {
      console.error('❌ Failed to create beverage:', createData.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestBeverage();
