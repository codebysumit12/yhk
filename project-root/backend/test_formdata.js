import FormData from 'form-data';
import fetch from 'node-fetch';

const form = new FormData();
form.append('name', 'Node.js Test Ingredient');
form.append('description', 'Testing with Node.js FormData');
form.append('category', '50d5db7f8a8b9fa91e000001');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OWZlNjg5ZTllY2RjYTk5ZTQzMzI1NyIsImlhdCI6MTc3Mjg2NjE2MCwiZXhwIjoxNzc1NDU4MTYwfQ.grH-Lt6QshTBk9ZkoTo7zEGfHGL4Hqiv109l4JEZ2ac';

fetch('http://localhost:5001/api/ingredients/no-image', {
  method: 'POST',
  body: form,
  headers: {
    'Authorization': `Bearer ${token}`,
    ...form.getHeaders()
  }
})
.then(response => response.json())
.then(data => console.log('SUCCESS:', data))
.catch(error => console.error('ERROR:', error));
