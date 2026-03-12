#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of JSX files to update
const files = [
  'src/admin-view/pages/BannersPage.jsx',
  'src/admin-view/pages/Categories.jsx',
  'src/admin-view/pages/CategoriesPage.jsx',
  'src/admin-view/pages/DeliveriesPage.jsx',
  'src/admin-view/pages/IngredientsPage.jsx',
  'src/admin-view/pages/ItemsPage.jsx',
  'src/admin-view/pages/MenuManagement.jsx',
  'src/admin-view/pages/OrdersPage.jsx',
  'src/customer-view/pages/Ingredients.jsx',
  'src/customer-view/pages/Menu.jsx',
  'src/customer-view/pages/Menu_LAYOUT.jsx',
  'src/customer-view/pages/MyOrders.jsx',
  'src/customer-view/pages/RelatedItems.jsx',
  'src/customer-view/pages/Login.jsx',
  'src/customer-view/pages/Signup.jsx',
  'src/customer-view/pages/Checkoutpage.jsx',
  'src/customer-view/pages/Main.jsx',
  'src/admin-view/pages/Customers.jsx'
];

const updateFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import statement after the last import
    const importRegex = /import.*from.*['"];?\s*\n/g;
    const imports = content.match(importRegex);
    const lastImport = imports ? imports[imports.length - 1] : '';
    
    if (!content.includes('import { API_CONFIG }')) {
      content = content.replace(
        lastImport,
        lastImport + 'import { API_CONFIG } from \'../../config/api\';\n'
      );
    }
    
    // Replace hardcoded API URLs
    content = content.replace(/const API_URL = 'http:\/\/localhost:5001\/api';/g, 'const API_URL = API_CONFIG.API_URL;');
    content = content.replace(/'http:\/\/localhost:5001\/api'/g, 'API_CONFIG.API_URL');
    
    // For Signup.jsx with different port
    if (filePath.includes('Signup.jsx')) {
      content = content.replace(/'http:\/\/localhost:5000\/api'/g, 'API_CONFIG.USER_API_URL');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
};

// Update all files
files.forEach(updateFile);
console.log('API URL updates completed!');
