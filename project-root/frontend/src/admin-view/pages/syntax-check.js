const fs = require('fs');
const acorn = require('acorn');

try {
  const content = fs.readFileSync('ItemsPage.jsx', 'utf8');
  
  // Remove JSX syntax for basic checking
  const jsContent = content
    .replace(/<[^>]*>/g, '') // Remove JSX tags
    .replace(/\{[^}]*\}/g, '{}'); // Replace complex expressions
  
  acorn.parse(jsContent, { ecmaVersion: 2020, sourceType: 'module' });
  console.log('Syntax is valid');
} catch (error) {
  console.error('Syntax error:', error.message);
  console.error('Line:', error.loc?.line);
  console.error('Column:', error.loc?.column);
}
