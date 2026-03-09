import Ingredient from './models/Ingredient.js';
console.log('=== SCHEMA FIELDS CHECK ===');
console.log('Available fields:', Object.keys(Ingredient.schema.paths));
console.log('Total fields count:', Object.keys(Ingredient.schema.paths).length);
console.log('=== EXPECTED CLEAN FIELDS ===');
const expectedFields = [
  '_id', 'name', 'slug', 'description', 'category', 'image', 
  'nutritionPer100g', 'dietaryInfo', 'healthBenefits', 'preparationSteps', 
  'origin', 'displayOrder', 'isActive', 'createdBy', 'createdAt', 'updatedAt', '__v'
];
console.log('Expected fields:', expectedFields);
console.log('Missing expected fields:', expectedFields.filter(field => !Object.keys(Ingredient.schema.paths).includes(field)));
console.log('Unexpected fields:', Object.keys(Ingredient.schema.paths).filter(field => !expectedFields.includes(field)));
