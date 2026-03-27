import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:50017/api'; // Updated to match running server port
const ADMIN_EMAIL = 'admin@yhk.com';
const ADMIN_PASSWORD = 'admin123';

// Test data for different categories
const testItems = {
  drinks: [
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice with pulp',
      price: 89,
      discountPrice: 79,
      type: 'drinks',
      preparationTime: 3,
      servingSize: '300ml',
      calories: 120,
      ingredients: ['Fresh Oranges', 'Ice', 'Sugar'],
      allergens: [],
      isAvailable: true,
      isFeatured: true
    },
    {
      name: 'Iced Coffee',
      description: 'Chilled coffee with milk and ice',
      price: 120,
      type: 'drinks',
      preparationTime: 5,
      servingSize: '250ml',
      calories: 95,
      ingredients: ['Coffee', 'Milk', 'Ice', 'Sugar Syrup'],
      allergens: ['Contains dairy'],
      isAvailable: true,
      isFeatured: false
    }
  ],
  smoothies: [
    {
      name: 'Mango Banana Smoothie',
      description: 'Creamy blend of mango and banana',
      price: 150,
      discountPrice: 129,
      type: 'smoothies',
      preparationTime: 7,
      servingSize: '350ml',
      calories: 220,
      ingredients: ['Mango', 'Banana', 'Yogurt', 'Honey', 'Ice'],
      allergens: ['Contains dairy'],
      isAvailable: true,
      isFeatured: true
    },
    {
      name: 'Green Detox Smoothie',
      description: 'Healthy green smoothie with spinach and fruits',
      price: 140,
      type: 'smoothies',
      preparationTime: 6,
      servingSize: '300ml',
      calories: 180,
      ingredients: ['Spinach', 'Apple', 'Cucumber', 'Lemon', 'Ginger'],
      allergens: [],
      isAvailable: true,
      isFeatured: false
    }
  ],
  desserts: [
    {
      name: 'Chocolate Brownie',
      description: 'Warm chocolate brownie with vanilla ice cream',
      price: 180,
      discountPrice: 149,
      type: 'desserts',
      preparationTime: 8,
      servingSize: '1 piece',
      calories: 380,
      ingredients: ['Chocolate', 'Flour', 'Butter', 'Eggs', 'Vanilla Ice Cream'],
      allergens: ['Contains dairy', 'Contains gluten', 'Contains eggs'],
      isAvailable: true,
      isFeatured: true
    },
    {
      name: 'Fruit Salad Bowl',
      description: 'Fresh seasonal fruits with honey dressing',
      price: 120,
      type: 'desserts',
      preparationTime: 5,
      servingSize: '1 bowl',
      calories: 150,
      ingredients: ['Mixed Fruits', 'Honey', 'Mint Leaves'],
      allergens: [],
      isAvailable: true,
      isFeatured: false
    }
  ]
};

// Helper function to get admin token
async function getAdminToken() {
  try {
    console.log('🔐 Getting admin token...');
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      console.log('✅ Admin token obtained successfully');
      return data.token;
    } else {
      throw new Error(data.message || 'Failed to get admin token');
    }
  } catch (error) {
    console.error('❌ Error getting admin token:', error.message);
    throw error;
  }
}

// Helper function to create a test image file (optional)
function createTestImage() {
  // Create a simple test image buffer (1x1 pixel PNG)
  const pngData = Buffer.from([
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
  
  return {
    buffer: pngData,
    filename: 'test-image.png',
    mimeType: 'image/png'
  };
}

// Main function to test item creation
async function testItemCreation() {
  let token;
  let results = {
    drinks: { success: 0, failed: 0, errors: [] },
    smoothies: { success: 0, failed: 0, errors: [] },
    desserts: { success: 0, failed: 0, errors: [] }
  };

  try {
    // Get admin token
    token = await getAdminToken();
    
    console.log('\n🚀 Starting item creation tests...\n');
    
    // Test each category
    for (const [category, items] of Object.entries(testItems)) {
      console.log(`\n📦 Testing ${category.toUpperCase()} category:`);
      console.log('='.repeat(50));
      
      for (const item of items) {
        try {
          console.log(`\n➕ Creating item: ${item.name}`);
          
          // Create form data
          const formData = new FormData();
          
          // Add all item fields
          formData.append('name', item.name);
          formData.append('description', item.description);
          formData.append('price', item.price);
          formData.append('type', item.type);
          formData.append('isAvailable', item.isAvailable);
          formData.append('isFeatured', item.isFeatured);
          formData.append('preparationTime', item.preparationTime);
          formData.append('servingSize', item.servingSize);
          formData.append('calories', item.calories);
          formData.append('ingredients', JSON.stringify(item.ingredients));
          formData.append('allergens', JSON.stringify(item.allergens));
          
          if (item.discountPrice) {
            formData.append('discountPrice', item.discountPrice);
          }
          
          // Add test image (optional - uncomment if you want to test with actual image)
          // const testImage = createTestImage();
          // formData.append('images', testImage.buffer, {
          //   filename: testImage.filename,
          //   contentType: testImage.mimeType
          // });
          
          // Make API call
          const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            console.log(`✅ Success: ${item.name} created with ID: ${data.data._id}`);
            results[category].success++;
          } else {
            console.log(`❌ Failed: ${item.name} - ${data.message || 'Unknown error'}`);
            results[category].failed++;
            results[category].errors.push({
              item: item.name,
              error: data.message || 'Unknown error'
            });
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.log(`❌ Error creating ${item.name}:`, error.message);
          results[category].failed++;
          results[category].errors.push({
            item: item.name,
            error: error.message
          });
        }
      }
    }
    
    // Print final results
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    for (const [category, result] of Object.entries(results)) {
      console.log(`\n🍹 ${category.toUpperCase()}:`);
      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      
      if (result.errors.length > 0) {
        console.log('   🚨 Errors:');
        result.errors.forEach(err => {
          console.log(`      - ${err.item}: ${err.error}`);
        });
      }
      
      totalSuccess += result.success;
      totalFailed += result.failed;
    }
    
    console.log('\n📈 OVERALL TOTAL:');
    console.log(`   ✅ Total Success: ${totalSuccess}`);
    console.log(`   ❌ Total Failed: ${totalFailed}`);
    console.log(`   📊 Success Rate: ${((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Function to test fetching items
async function testFetchingItems(token) {
  console.log('\n🔍 Testing item fetching...');
  
  const categories = ['drinks', 'smoothies', 'desserts'];
  
  for (const category of categories) {
    try {
      console.log(`\n📋 Fetching ${category}...`);
      
      const response = await fetch(`${API_URL}/items?type=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ Found ${data.data.length} ${category}`);
        
        // Show first few items
        data.data.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - ₹${item.price}`);
        });
        
        if (data.data.length > 3) {
          console.log(`   ... and ${data.data.length - 3} more`);
        }
      } else {
        console.log(`❌ Failed to fetch ${category}: ${data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Error fetching ${category}:`, error.message);
    }
  }
}

// Function to test item updates
async function testItemUpdates(token) {
  console.log('\n🔄 Testing item updates...');
  
  try {
    // First get some items to update
    const response = await fetch(`${API_URL}/items?type=drinks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.data.length > 0) {
      const itemToUpdate = data.data[0];
      console.log(`\n📝 Updating item: ${itemToUpdate.name}`);
      
      const updateData = {
        name: `${itemToUpdate.name} (Updated)`,
        price: itemToUpdate.price + 10,
        isFeatured: !itemToUpdate.isFeatured
      };
      
      const updateResponse = await fetch(`${API_URL}/items/${itemToUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok && updateResult.success) {
        console.log(`✅ Item updated successfully`);
        console.log(`   New name: ${updateResult.data.name}`);
        console.log(`   New price: ₹${updateResult.data.price}`);
      } else {
        console.log(`❌ Failed to update item: ${updateResult.message}`);
      }
    } else {
      console.log('⚠️ No items found to test updates');
    }
    
  } catch (error) {
    console.log(`❌ Error testing updates:`, error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🍹 Beverages & Desserts Item Creation Test Suite');
  console.log('='.repeat(60));
  
  try {
    const token = await getAdminToken();
    
    // Run all tests
    await testItemCreation();
    await testFetchingItems(token);
    await testItemUpdates(token);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
runAllTests();
