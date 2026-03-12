#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Comprehensive ESLint fixes
const fixes = [
  {
    file: 'src/admin-view/pages/BannersPage.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchBanners = async () => {',
        to: 'const fetchBanners = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    fetchBanners();\n  }, []);',
        to: 'useEffect(() => {\n    fetchBanners();\n  }, [fetchBanners]);'
      }
    ]
  },
  {
    file: 'src/admin-view/pages/CategoriesPage.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchCategories = async () => {',
        to: 'const fetchCategories = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    fetchCategories();\n  }, []);',
        to: 'useEffect(() => {\n    fetchCategories();\n  }, [fetchCategories]);'
      }
    ]
  },
  {
    file: 'src/admin-view/pages/DeliveriesPage.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchDeliveryOrders = async () => {',
        to: 'const fetchDeliveryOrders = useCallback(async () => {'
      },
      { 
        from: '}, []);',
        to: '}, [filterStatus, token]);'
      }
    ]
  },
  {
    file: 'src/admin-view/pages/IngredientsPage.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const [currentPage, setCurrentPage] = useState(1);',
        to: '// const [currentPage, setCurrentPage] = useState(1); // Removed unused'
      },
      { 
        from: 'const fetchIngredients = async () => {',
        to: 'const fetchIngredients = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    fetchIngredients();\n    fetchCategories();\n  }, []);',
        to: 'useEffect(() => {\n    fetchIngredients();\n    fetchCategories();\n  }, [fetchIngredients, fetchCategories]);'
      },
      {
        from: 'const addArrayItem = (array, item) => {',
        to: '// const addArrayItem = (array, item) => { // Removed unused'
      },
      {
        from: 'const removeArrayItem = (array, index) => {',
        to: '// const removeArrayItem = (array, index) => { // Removed unused'
      }
    ]
  },
  {
    file: 'src/admin-view/pages/ItemsPage.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchItems = async () => {',
        to: 'const fetchItems = useCallback(async () => {'
      },
      { 
        from: 'const fetchCategories = async () => {',
        to: 'const fetchCategories = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    fetchItems();\n    fetchCategories();\n  }, []);',
        to: 'useEffect(() => {\n    fetchItems();\n    fetchCategories();\n  }, [fetchItems, fetchCategories]);'
      },
      {
        from: 'const openIngredientsModal = () => {',
        to: '// const openIngredientsModal = () => { // Removed unused'
      },
      {
        from: 'const toggleFeatured = () => {',
        to: '// const toggleFeatured = () => { // Removed unused'
      },
      {
        from: 'const spiceLevelEmojis = {',
        to: '// const spiceLevelEmojis = { // Removed unused'
      }
    ]
  },
  {
    file: 'src/admin-view/pages/OrdersPage.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchOrders = async () => {',
        to: 'const fetchOrders = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    fetchOrders();\n  }, []);',
        to: 'useEffect(() => {\n    fetchOrders();\n  }, [fetchOrders]);'
      }
    ]
  },
  {
    file: 'src/customer-view/pages/Checkoutpage.jsx',
    imports: 'import React, { useState, useEffect, useRef } from \'react\';',
    replacements: [
      { 
        from: 'import { API_CONFIG } from \'../../config/api\';',
        to: '// import { API_CONFIG } from \'../../config/api\'; // Removed unused'
      },
      { 
        from: 'const setupRecaptcha = () => {',
        to: '// const setupRecaptcha = () => { // Removed unused'
      },
      {
        from: '<a className="payment-method">',
        to: '<button type="button" className="payment-method">'
      }
    ]
  },
  {
    file: 'src/customer-view/pages/Main.jsx',
    imports: 'import React, { useState, useEffect } from \'react\';',
    replacements: [
      { 
        from: 'import { API_CONFIG } from \'../config/api\';',
        to: '// import { API_CONFIG } from \'../config/api\'; // Removed unused'
      },
      { 
        from: 'const [filteredRestaurants, setFilteredRestaurants] = useState([]);',
        to: '// const [filteredRestaurants, setFilteredRestaurants] = useState([]); // Removed unused'
      }
    ]
  },
  {
    file: 'src/customer-view/pages/MyOrders.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchMyOrders = async () => {',
        to: 'const fetchMyOrders = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    if (!token) {\n      navigate(\'/auth\');\n      return;\n    }\n    fetchMyOrders();\n  }, []);',
        to: 'useEffect(() => {\n    if (!token) {\n      navigate(\'/auth\');\n      return;\n    }\n    fetchMyOrders();\n  }, [fetchMyOrders, token, navigate]);'
      }
    ]
  },
  {
    file: 'src/customer-view/pages/MyProfile.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'const fetchProfile = async () => {',
        to: 'const fetchProfile = useCallback(async () => {'
      },
      { 
        from: 'useEffect(() => {\n    if (!token) {\n      navigate(\'/auth\');\n      return;\n    }\n    fetchProfile();\n  }, []);',
        to: 'useEffect(() => {\n    if (!token) {\n      navigate(\'/auth\');\n      return;\n    }\n    fetchProfile();\n  }, [fetchProfile, navigate, token]);'
      }
    ]
  },
  {
    file: 'src/customer-view/pages/TrackMyOrder.jsx',
    imports: 'import React, { useState, useEffect, useCallback } from \'react\';',
    replacements: [
      { 
        from: 'useEffect(() => {\n    const fetchOrders = async () => {',
        to: 'useEffect(() => {\n    const fetchOrders = useCallback(async () => {'
      },
      { 
        from: 'fetchOrders();\n  }, []);',
        to: 'fetchOrders();\n  }, [fetchOrders]);'
      }
    ]
  },
  {
    file: 'src/pages/Auth.jsx',
    imports: 'import React, { useState } from \'react\';',
    replacements: [
      { 
        from: '<a href="#" className="forgot-link">',
        to: '<button type="button" className="forgot-link" onClick={(e) => { e.preventDefault(); /* Add forgot password logic */ }}>'
      }
    ]
  }
];

fixes.forEach(({ file, imports, replacements }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add useCallback import if needed
    if (imports && !content.includes('useCallback')) {
      content = content.replace('import React, { useState, useEffect }', imports);
    }
    
    // Apply all replacements
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('All ESLint fixes completed!');
