import fetch from 'node-fetch';

const API_URL = 'http://localhost:50017/api';

async function test401Error() {
  try {
    // Test the exact same way OthersPage.jsx fetches items
    const token = localStorage.getItem('token');
    console.log('🔍 Testing with token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`${API_URL}/items?type=drinks`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers);
    
    const data = await response.json();
    console.log('📊 Response data:', data);
    
    if (response.status === 401) {
      console.log('❌ 401 ERROR STILL EXISTS!');
      return false;
    } else {
      console.log('✅ 401 ERROR FIXED!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

test401Error();
