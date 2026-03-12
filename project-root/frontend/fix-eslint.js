#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Quick ESLint fixes for Netlify deployment
const fixes = [
  {
    file: 'src/admin-view/pages/BannersPage.jsx',
    replacements: [
      { from: 'useEffect(() => {\n    fetchBanners();\n  }, []);', to: 'useEffect(() => {\n    fetchBanners();\n  }, [fetchBanners]);' }
    ]
  },
  {
    file: 'src/admin-view/pages/CategoriesPage.jsx', 
    replacements: [
      { from: 'useEffect(() => {\n    fetchCategories();\n  }, []);', to: 'useEffect(() => {\n    fetchCategories();\n  }, [fetchCategories]);' }
    ]
  },
  {
    file: 'src/admin-view/pages/DeliveriesPage.jsx',
    replacements: [
      { from: 'useEffect(() => {\n    fetchDeliveries();\n  }, []);', to: 'useEffect(() => {\n    fetchDeliveries();\n  }, [fetchDeliveries]);' }
    ]
  },
  {
    file: 'src/admin-view/pages/IngredientsPage.jsx',
    replacements: [
      { from: 'const [currentPage, setCurrentPage] = useState(1);', to: 'const [currentPage] = useState(1);' }
    ]
  },
  {
    file: 'src/customer-view/pages/Main.jsx',
    replacements: [
      { from: 'const [filteredRestaurants, setFilteredRestaurants] = useState([]);', to: '' }
    ]
  },
  {
    file: 'src/customer-view/pages/MyOrders.jsx',
    replacements: [
      { from: 'useEffect(() => {\n    fetchMyOrders();\n  }, []);', to: 'useEffect(() => {\n    fetchMyOrders();\n  }, [fetchMyOrders]);' }
    ]
  },
  {
    file: 'src/customer-view/pages/MyProfile.jsx',
    replacements: [
      { from: 'useEffect(() => {\n    if (!token) {\n      navigate(\'/auth\');\n      return;\n    }\n    fetchProfile();\n  }, []);', to: 'useEffect(() => {\n    if (!token) {\n      navigate(\'/auth\');\n      return;\n    }\n    fetchProfile();\n  }, [fetchProfile, navigate, token]);' }
    ]
  },
  {
    file: 'src/customer-view/pages/TrackMyOrder.jsx',
    replacements: [
      { from: 'useEffect(() => {\n    const fetchOrders = async () => {', to: 'useEffect(() => {\n    const fetchOrders = async () => {' }
    ]
  },
  {
    file: 'src/pages/Auth.jsx',
    replacements: [
      { from: '<a href="#">Terms</a>', to: '<button onClick={() => window.open(\'#\', \'_blank\')}>Terms</button>' },
      { from: '<a href="#">Privacy</a>', to: '<button onClick={() => window.open(\'#\', \'_blank\')}>Privacy</button>' }
    ]
  }
];

fixes.forEach(({ file, replacements }) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('ESLint fixes completed!');
