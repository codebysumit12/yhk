const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yhk-food-delivery')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Import Order model after connection
    const Order = require('./models/Order.js');
    const MenuItem = require('./models/MenuItem.js');
    
    // First create a test menu item
    try {
      const testItem = await MenuItem.create({
        name: 'Test Burger',
        price: 150,
        discountPrice: 130,
        category: 'fast-food',
        description: 'Delicious test burger',
        images: [{ url: 'test-image.jpg' }]
      });
      
      console.log('Created test menu item:', testItem.name);
      
      // Create sample orders
      const sampleOrders = [
        {
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210'
          },
          orderItems: [
            {
              menuItem: testItem._id,
              name: 'Test Burger',
              quantity: 2,
              price: 150,
              subtotal: 300,
              image: 'test-image.jpg'
            }
          ],
          orderType: 'delivery',
          deliveryAddress: {
            street: '123 Main Street',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411001'
          },
          paymentMethod: 'cod',
          pricing: {
            subtotal: 300,
            deliveryFee: 30,
            tax: 15,
            discount: 0,
            total: 345
          },
          status: 'pending'
        },
        {
          customer: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '9876543211'
          },
          orderItems: [
            {
              menuItem: testItem._id,
              name: 'Test Pizza',
              quantity: 1,
              price: 200,
              subtotal: 200,
              image: 'test-image.jpg'
            }
          ],
          orderType: 'takeaway',
          deliveryAddress: {
            street: '456 Oak Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001'
          },
          paymentMethod: 'online',
          pricing: {
            subtotal: 200,
            deliveryFee: 0,
            tax: 10,
            discount: 0,
            total: 210
          },
          status: 'confirmed'
        }
      ];
      
      for (const orderData of sampleOrders) {
        try {
          const order = await Order.create(orderData);
          console.log('Created sample order:', order.orderNumber);
        } catch (error) {
          console.error('Error creating sample order:', error);
        }
      }
      
      console.log('Sample orders created successfully!');
    } catch (error) {
      console.error('Error setting up test data:', error);
    }
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
