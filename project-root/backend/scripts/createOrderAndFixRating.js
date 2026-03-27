import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
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
  
  // Now create the order
  const orderData = {
    _id: '69ba82d96de9bed86731d6ea',
    userId: '69b7b7d2834a8bdcf131272a',
    customer: {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890'
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
    paymentMethod: 'online',
    paymentStatus: 'paid',
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
    specialInstructions: 'rt',
    timeline: [{
      status: 'delivered',
      timestamp: new Date(),
      message: 'Order delivered'
    }],
    orderNumber: 'YHK000052',
    paidAt: new Date('2026-03-18T10:48:50.616+00:00'),
    rating: {
      stars: 1,
      comment: '',
      ratedAt: new Date('2026-03-25T10:45:49.972+00:00')
    }
  };
  
  const order = await Order.create(orderData);
  console.log('Order created:', order.orderNumber);
  
  // Now trigger the rating update
  console.log('Triggering rating update...');
  
  // Import and run the update function
  const { updateItemRatings } = await import('../controllers/orderController.js');
  await updateItemRatings(order.orderItems);
  
  // Check the result
  const updatedItem = await Item.findById('69c0ddb502811983d1005fc0');
  console.log('Updated item ratings:', updatedItem.ratings);
  
  mongoose.disconnect();
}).catch(console.error);
