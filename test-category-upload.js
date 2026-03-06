import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

// Create a simple test image buffer (1x1 pixel PNG)
const testImageBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
  0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
  0x44, 0xAE, 0x42, 0x60, 0x82
]);

// Save test image temporarily
fs.writeFileSync('test-category.png', testImageBuffer);

const testCategoryUpload = async () => {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:5001/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@yhk.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful');

    // Create form data with image
    const form = new FormData();
    form.append('image', fs.createReadStream('test-category.png'), 'test-category.png');
    form.append('name', 'Test Category');
    form.append('description', 'A test category for Cloudinary integration');
    form.append('icon', '🍕');
    form.append('color', '#ff6b6b');
    form.append('displayOrder', '1');

    // Create category with image
    const response = await fetch('http://localhost:5001/api/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Category created successfully!');
      console.log('Category data:', JSON.stringify(data.data, null, 2));
    } else {
      console.error('❌ Category creation failed:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync('test-category.png')) {
      fs.unlinkSync('test-category.png');
    }
  }
};

testCategoryUpload();
