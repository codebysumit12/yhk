#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Quick fix script to remove remaining unused variables
const fixes = [
  {
    file: 'src/customer-view/pages/Checkoutpage.jsx',
    replacements: [
      { from: 'setIsLoading(true);', to: '' },
      { from: 'setIsLoading(false);', to: '' }
    ]
  },
  {
    file: 'src/customer-view/pages/Main.jsx',
    replacements: [
      { from: 'const [filteredRestaurants, setFilteredRestaurants] = useState([]);', to: '' }
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

console.log('Quick fixes completed!');
