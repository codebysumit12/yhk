import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 Creating test order and checking rating propagation...');
  
  // First, make sure the item exists
  let item = await Item.findById('69c0ddb502811983d1005fc0');
  
  if (!item) {
    console.log('Creating missing item...');
    item = await Item.create({
      _id: '69c0ddb502811983d1005fc0',
      name: 'tyytty',
      slug: 'tyytty',
      description: 'weew',
      categoryId: '69c02026ade712947c4b700e',
      price: 1,
      discountPrice: 1,
      images: [{}],
      type: 'veg',
      spiceLevel: 'mild',
      ingredients: ['ingredient1'],
      allergens: ['allergen1'],
      tags: ['tag1'],
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      displayOrder: 0,
      nutritionInfo: {},
      ratings: { average: 0, count: 0 },
      soldCount: 0,
      calories: 12,
      preparationTime: 12,
      servingSize: '1',
      createdBy: '699fe689e9ecdca99e433257'
    });
    console.log('Item created:', item.name);
  }
  
  // Create the order with rating
  const orderData = {
    _id: '69c2d29a8c5a59b5128f8bee',
    userId: '69b7b7d2834a8bdcf131272a',
    customer: {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '9370337263'
    },
    orderItems: [{
      menuItem: '69c0ddb502811983d1005fc0',
      name: 'tyytty',
      price: 1,
      quantity: 1,
      subtotal: 1,
      image: null
    }],
    orderType: 'delivery',
    deliveryAddress: {
      street: 'Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345'
    },
    status: 'delivered',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    pricing: {
      subtotal: 1,
      deliveryFee: 0,
      tax: 0,
      discount: 0,
      total: 1
    },
    delivery: {
      type: 'standard',
      estimatedTime: new Date(),
      actualTime: new Date()
    },
    specialInstructions: 'asa',
    timeline: [{
      status: 'delivered',
      timestamp: new Date(),
      message: 'Order delivered'
    }],
    orderNumber: 'YHK000068',
    rating: {
      stars: 1,
      comment: '',
      ratedAt: new Date('2026-03-26T04:51:32.267+00:00')
    }
  };
  
  // Check if order already exists
  const existingOrder = await Order.findById('69c2d29a8c5a59b5128f8bee');
  if (!existingOrder) {
    const order = await Order.create(orderData);
    console.log('Order created:', order.orderNumber);
    
    // Now test the rating update mechanism
    console.log('🔍 Testing rating update mechanism...');
    
    // Import and run the update function
    try {
      const { updateItemRatings } = await import('../controllers/orderController.js');
      await updateItemRatings(order.orderItems);
      
      // Check the result
      const updatedItem = await Item.findById('69c0ddb502811983d1005fc0');
      console.log('Updated item ratings:', updatedItem.ratings);
      
      if (updatedItem.ratings.count > 0) {
        console.log('✅ Rating propagation working!');
      } else {
        console.log('❌ Rating propagation failed');
      }
    } catch (err) {
      console.error('Error calling updateItemRatings:', err);
    }
  } else {
    console.log('Order already exists, testing update...');
    
    // Test the update function
    try {
      const { updateItemRatings } = await import('../controllers/orderController.js');
      await updateItemRatings(existingOrder.orderItems);
      
      // Check the result
      const updatedItem = await Item.findById('69c0ddb502811983d1005fc0');
      console.log('Updated item ratings:', updatedItem.ratings);
    } catch (err) {
      console.error('Error calling updateItemRatings:', err);
    }
  }
  
  mongoose.disconnect();
}).catch(console.error);
