// Frontend debugging script
// Paste this in your browser console on the menu page

console.log('🔍 FRONTEND DEBUGGING');
console.log('===================');

// 1. Check if items are being loaded
console.log('Items state:', window.items || 'Not found in window');

// 2. Check API calls
console.log('Checking recent API calls...');
fetch('http://localhost:50017/api/items?isAvailable=true')
  .then(response => {
    console.log('API Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('API Response data:', data);
    console.log('Items count:', data.data?.length || 0);
    
    // Check if items have required fields
    if (data.data && data.data.length > 0) {
      console.log('Sample item structure:', data.data[0]);
      console.log('Has category field:', 'category' in data.data[0]);
      console.log('Has isAvailable field:', 'isAvailable' in data.data[0]);
    }
  })
  .catch(error => {
    console.error('API Error:', error);
  });

// 3. Check React state (if possible)
console.log('Checking React component state...');
const reactRoot = document.querySelector('#root');
if (reactRoot) {
  console.log('React root found:', reactRoot);
}

// 4. Check for any JavaScript errors
console.log('Checking for errors...');
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
});

console.log('✅ Frontend debugging initialized');
console.log('Check the Network tab in DevTools for API requests');
