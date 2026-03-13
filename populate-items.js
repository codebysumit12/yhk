import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ATLAS_URI = 'mongodb+srv://sumitkhekare_db_user:qk1C9B6QOlbZyihS@yhk.fm9auks.mongodb.net/yhk_database?appName=YHK&retryWrites=true&w=majority';

// Import the Item model
import Item from './project-root/backend/models/Item.js';
import Category from './project-root/backend/models/Category.js';

const populateItems = async () => {
  try {
    console.log('🍽️ Populating Items collection with sample data...');
    
    await mongoose.connect(ATLAS_URI);
    
    // Get categories to assign items to
    const categories = await Category.find({ isActive: true });
    console.log(`Found ${categories.length} active categories`);
    
    if (categories.length === 0) {
      console.log('❌ No active categories found!');
      return;
    }
    
    // Sample items data following the Item schema
    const sampleItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with fresh lettuce, tomato, and our special sauce',
        price: 299,
        categoryId: categories[0]._id, // Use first category
        type: 'non-veg',
        spiceLevel: 'medium',
        preparationTime: 20,
        isAvailable: true,
        isFeatured: true,
        isPopular: true,
        ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Cheese', 'Burger Bun'],
        tags: ['burger', 'beef', 'popular'],
        nutritionInfo: {
          protein: 25,
          carbs: 30,
          fat: 15,
          calories: 450
        }
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh mozzarella, tomato sauce, and basil',
        price: 399,
        categoryId: categories[1]?._id || categories[0]._id,
        type: 'veg',
        spiceLevel: 'none',
        preparationTime: 25,
        isAvailable: true,
        isFeatured: true,
        ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Pizza Dough'],
        tags: ['pizza', 'italian', 'vegetarian'],
        nutritionInfo: {
          protein: 15,
          carbs: 45,
          fat: 12,
          calories: 380
        }
      },
      {
        name: 'Chicken Tikka',
        description: 'Tender chicken marinated in authentic Indian spices and grilled to perfection',
        price: 349,
        categoryId: categories[2]?._id || categories[0]._id,
        type: 'non-veg',
        spiceLevel: 'hot',
        preparationTime: 30,
        isAvailable: true,
        isPopular: true,
        ingredients: ['Chicken', 'Yogurt', 'Tikka Masala', 'Ginger', 'Garlic'],
        tags: ['chicken', 'indian', 'spicy'],
        nutritionInfo: {
          protein: 35,
          carbs: 8,
          fat: 18,
          calories: 320
        }
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing',
        price: 249,
        categoryId: categories[3]?._id || categories[0]._id,
        type: 'veg',
        spiceLevel: 'none',
        preparationTime: 10,
        isAvailable: true,
        ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
        tags: ['salad', 'healthy', 'vegetarian'],
        nutritionInfo: {
          protein: 8,
          carbs: 12,
          fat: 15,
          calories: 220
        }
      },
      {
        name: 'Pasta Carbonara',
        description: 'Creamy Italian pasta with bacon, eggs, and parmesan cheese',
        price: 379,
        categoryId: categories[4]?._id || categories[0]._id,
        type: 'non-veg',
        spiceLevel: 'none',
        preparationTime: 22,
        isAvailable: true,
        isFeatured: false,
        ingredients: ['Pasta', 'Bacon', 'Eggs', 'Parmesan Cheese', 'Cream'],
        tags: ['pasta', 'italian', 'creamy'],
        nutritionInfo: {
          protein: 20,
          carbs: 50,
          fat: 22,
          calories: 480
        }
      },
      {
        name: 'Veggie Wrap',
        description: 'Fresh vegetables wrapped in a soft tortilla with hummus spread',
        price: 199,
        categoryId: categories[5]?._id || categories[0]._id,
        type: 'veg',
        spiceLevel: 'mild',
        preparationTime: 12,
        isAvailable: true,
        ingredients: ['Tortilla', 'Mixed Vegetables', 'Hummus', 'Lettuce', 'Tomato'],
        tags: ['wrap', 'vegetarian', 'healthy'],
        nutritionInfo: {
          protein: 8,
          carbs: 35,
          fat: 10,
          calories: 260
        }
      },
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon grilled with herbs and served with vegetables',
        price: 599,
        categoryId: categories[6]?._id || categories[0]._id,
        type: 'non-veg',
        spiceLevel: 'none',
        preparationTime: 25,
        isAvailable: true,
        isFeatured: true,
        ingredients: ['Salmon', 'Mixed Vegetables', 'Herbs', 'Olive Oil'],
        tags: ['fish', 'seafood', 'healthy'],
        nutritionInfo: {
          protein: 40,
          carbs: 15,
          fat: 25,
          calories: 420
        }
      },
      {
        name: 'Chocolate Brownie',
        description: 'Rich, fudgy chocolate brownie with a hint of vanilla',
        price: 149,
        categoryId: categories[7]?._id || categories[0]._id,
        type: 'veg',
        spiceLevel: 'none',
        preparationTime: 5,
        isAvailable: true,
        ingredients: ['Chocolate', 'Flour', 'Butter', 'Sugar', 'Vanilla'],
        tags: ['dessert', 'chocolate', 'sweet'],
        nutritionInfo: {
          protein: 4,
          carbs: 35,
          fat: 18,
          calories: 320
        }
      }
    ];
    
    // Clear existing items (except Test Burger)
    await Item.deleteMany({ name: { $ne: 'Test Burger' } });
    
    // Insert new items
    const insertedItems = await Item.insertMany(sampleItems);
    console.log(`✅ Successfully inserted ${insertedItems.length} items!`);
    
    // Display inserted items
    console.log('\n📋 Inserted Items:');
    insertedItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ₹${item.price} (${item.type})`);
    });
    
    // Update category itemCounts
    console.log('\n🔄 Updating category item counts...');
    for (const category of categories) {
      const count = await Item.countDocuments({ 
        categoryId: category._id,
        isAvailable: true 
      });
      await Category.findByIdAndUpdate(category._id, { itemCount: count });
      console.log(`   ${category.name}: ${count} items`);
    }
    
    // Verify total items
    const totalItems = await Item.countDocuments();
    console.log(`\n📊 Total items in collection: ${totalItems}`);
    
    await mongoose.disconnect();
    console.log('\n🎉 Items population completed!');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    process.exit(1);
  }
};

populateItems();
