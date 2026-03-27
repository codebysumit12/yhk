// Run this in browser console to check all localStorage keys
console.log('=== LOCALSTORAGE DIAGNOSTIC ===');

// Show all localStorage keys and values
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value);
}

// Check specifically for token variations
const tokenKeys = ['token', 'userToken', 'authToken', 'jwtToken', 'accessToken'];
console.log('\n=== TOKEN SEARCH ===');
tokenKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value ? 'exists' : 'missing');
});

// Check if user object contains token
const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('\n=== USER OBJECT ===');
    console.log('User:', user);
    console.log('User has token:', !!user.token);
  } catch (e) {
    console.log('User JSON parse error:', e);
  }
}

// Try to manually set token if missing
const currentToken = localStorage.getItem('token');
if (!currentToken) {
  console.log('\n=== MANUAL TOKEN FIX ===');
  console.log('Token is missing. Try logging in again.');
  console.log('Or check if login API is returning a token');
}
