import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

// Connect to database
await mongoose.connect('mongodb://localhost:27017/yhk_database');

console.log('🚀 Creating test items...');

try {
  // Get admin user for category creation
  const adminUser = await User.findOne({ email: 'admin@yhk.com' });
  
  if (!adminUser) {
    console.log('❌ Admin user not found');
    process.exit(1);
  }

  // Create categories first
  const categories = await Category.insertMany([
    {
      name: 'Main Course',
      slug: 'main-course',
      description: 'Main dishes and meals',
      icon: '🍽️',
      color: '#e23744',
      createdBy: adminUser._id
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Drinks and smoothies',
      icon: '🥤',
      color: '#22c55e',
      createdBy: adminUser._id
    },
    {
      name: 'Appetizers',
      slug: 'appetizers',
      description: 'Starters and salads',
      icon: '🥗',
      color: '#f59e0b',
      createdBy: adminUser._id
    }
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  const testItems = [
    {
      name: 'Healthy Veg Bowl',
      slug: 'healthy-veg-bowl',
      description: 'Nutritious bowl with fresh vegetables and quinoa',
      price: 250,
      discountPrice: 200,
      category: categories[0]._id, // Main Course
      rating: 4.5,
      images: [
        {
          url: 'https://example.com/veg-bowl.jpg',
          cloudinaryId: 'veg-bowl',
          isPrimary: true
        }
      ],
      healthBenefits: ['High Protein', 'Rich in Fiber', 'Low Calories'],
      preparationSteps: ['Cook quinoa', 'Prepare vegetables', 'Mix and serve'],
      preparationTime: 20,
      isAvailable: true,
      isFeatured: false,
      ingredients: ['quinoa', 'vegetables', 'olive oil'],
      calories: 320,
      type: 'veg'
    },
    {
      name: 'Fresh Fruit Smoothie',
      slug: 'fresh-fruit-smoothie',
      description: 'Refreshing smoothie with seasonal fruits',
      price: 150,
      discountPrice: 120,
      category: categories[1]._id, // Beverages
      rating: 4.8,
      images: [
        {
          url: 'https://example.com/smoothie.jpg',
          cloudinaryId: 'smoothie',
          isPrimary: true
        }
      ],
      healthBenefits: ['Vitamin Rich', 'Antioxidants', 'Natural Energy'],
      preparationSteps: ['Blend fruits', 'Add ice', 'Serve cold'],
      preparationTime: 10,
      isAvailable: true,
      isFeatured: true,
      ingredients: ['mango', 'banana', 'yogurt', 'honey'],
      calories: 180,
      type: 'vegan'
    },
    {
      name: 'Green Salad',
      slug: 'green-salad',
      description: 'Fresh garden salad with organic greens',
      price: 180,
      category: categories[2]._id, // Appetizers
      rating: 4.3,
      images: [
        {
          url: 'https://example.com/salad.jpg',
          cloudinaryId: 'salad',
          isPrimary: true
        }
      ],
      healthBenefits: ['Low Calorie', 'High Fiber', 'Vitamin Rich'],
      preparationSteps: ['Wash greens', 'Chop vegetables', 'Mix dressing'],
      preparationTime: 15,
      isAvailable: true,
      isFeatured: false,
      ingredients: ['lettuce', 'tomatoes', 'cucumber', 'olive oil'],
      calories: 120,
      type: 'veg'
    }
  ];

  // Insert test items
  const createdItems = await Item.insertMany(testItems);
  
  console.log(`✅ Successfully created ${createdItems.length} test items:`);
  createdItems.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name} - ₹${item.price}`);
    console.log(`   Category: ${item.category}`);
    console.log(`   Rating: ${item.rating}`);
    console.log('---');
  });

} catch (error) {
  console.error('❌ Error creating test items:', error.message);
} finally {
  await mongoose.disconnect();
  console.log('📴 Database connection closed');
}
