import fetch from 'node-fetch';

const API_URL = 'http://localhost:5004/api';

fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@yhk.com',
    password: 'admin123'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('TOKEN:', data.token);
    console.log('Copy this to browser console:');
    console.log(`localStorage.setItem('token', '${data.token}')`);
  } else {
    console.log('ERROR:', data.message);
  }
})
.catch(err => console.log('FETCH ERROR:', err));
