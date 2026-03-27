import fetch from 'node-fetch';

const API_URL = 'http://localhost:5004/api';

async function deleteCorruptedItem() {
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

    // Delete the corrupted item
    const deleteResponse = await fetch(`${API_URL}/items/69bc4ae568c86f7d5ebdba95`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const deleteData = await deleteResponse.json();
    
    if (deleteData.success) {
      console.log('✅ Corrupted item deleted successfully!');
    } else {
      console.error('❌ Failed to delete item:', deleteData.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deleteCorruptedItem();
