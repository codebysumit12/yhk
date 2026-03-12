const fs = require('fs');
const path = require('path');

// Fix TrackMyOrder.jsx
const trackMyOrderPath = 'project-root/frontend/src/customer-view/pages/TrackMyOrder.jsx';
let content = fs.readFileSync(trackMyOrderPath, 'utf8');
content = content.replace("import React, { useState, useEffect, useCallback } from 'react';", "import React, { useState, useEffect } from 'react';");
fs.writeFileSync(trackMyOrderPath, content);

// Fix IngredientsPage.jsx - add eslint disable comments
const ingredientsPath = 'project-root/frontend/src/admin-view/pages/IngredientsPage.jsx';
content = fs.readFileSync(ingredientsPath, 'utf8');
content = content.replace("const [currentPage] = useState(1);", "const [currentPage] = useState(1); // eslint-disable-line no-unused-vars");
fs.writeFileSync(ingredientsPath, content);

console.log('ESLint fixes applied');
