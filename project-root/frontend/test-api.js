// This is a test API call - run this in browser console on your frontend
console.log('🔍 Testing API call from frontend...');

fetch('http://localhost:50017/api/items/69c0ddb502811983d1005fc0')
  .then(response => response.json())
  .then(data => {
    console.log('📡 API Response:', data);
    if (data.success && data.data) {
      console.log(`Item: ${data.data.name}`);
      console.log(`Ratings: avg=${data.data.ratings?.average}, count=${data.data.ratings?.count}`);
    }
  })
  .catch(error => console.error('API Error:', error));
