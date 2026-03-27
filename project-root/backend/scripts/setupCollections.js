const mongoose = require('mongoose');
const connectDB = require('../config/db');

// MongoDB JSON Schema Validators for each collection
const collectionValidators = {
  menu_items: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'description', 'price', 'category'],
        properties: {
          name: { bsonType: 'string', description: 'Name is required' },
          description: { bsonType: 'string', description: 'Description is required' },
          price: { bsonType: 'double', minimum: 0, description: 'Price must be a positive number' },
          category: {
            bsonType: 'string',
            enum: ['veg', 'non-veg', 'vegan', 'egg', 'drinks', 'smoothies', 'desserts'],
            description: 'Valid category is required'
          },
          image: { bsonType: 'string' },
          isAvailable: { bsonType: 'bool' },
          preparationTime: { bsonType: 'int' },
          isSpecial: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },
  orders: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'orderItems', 'totalAmount', 'orderType'],
        properties: {
          userId: { bsonType: 'objectId', description: 'User ID reference is required' },
          orderItems: {
            bsonType: 'array',
            items: {
              bsonType: 'object',
              required: ['menuItem', 'name', 'price', 'quantity', 'subtotal'],
              properties: {
                menuItem: { bsonType: 'objectId' },
                name: { bsonType: 'string' },
                price: { bsonType: 'double' },
                quantity: { bsonType: 'int', minimum: 1 },
                subtotal: { bsonType: 'double' }
              }
            }
          },
          totalAmount: { bsonType: 'double', minimum: 0 },
          status: {
            bsonType: 'string',
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
          },
          orderType: {
            bsonType: 'string',
            enum: ['dine_in', 'takeaway', 'delivery']
          },
          deliveryAddress: {
            bsonType: 'object',
            properties: {
              street: { bsonType: 'string' },
              city: { bsonType: 'string' },
              state: { bsonType: 'string' },
              zipCode: { bsonType: 'string' },
              country: { bsonType: 'string' }
            }
          },
          specialInstructions: { bsonType: 'string' },
          paymentStatus: {
            bsonType: 'string',
            enum: ['pending', 'paid', 'failed', 'refunded']
          },
          paymentMethod: {
            bsonType: 'string',
            enum: ['cash', 'card', 'online']
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },
  reservations: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'guestName', 'guestEmail', 'guestPhone', 'date', 'time', 'partySize'],
        properties: {
          userId: { bsonType: 'objectId', description: 'User ID reference is required' },
          guestName: { bsonType: 'string', description: 'Guest name is required' },
          guestEmail: { bsonType: 'string', description: 'Guest email is required' },
          guestPhone: { bsonType: 'string', description: 'Guest phone is required' },
          date: { bsonType: 'date', description: 'Reservation date is required' },
          time: { bsonType: 'string', description: 'Reservation time is required' },
          partySize: { bsonType: 'int', minimum: 1, maximum: 20 },
          tableNumber: { bsonType: 'int' },
          status: {
            bsonType: 'string',
            enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']
          },
          specialRequests: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },
  reviews: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'rating', 'comment'],
        properties: {
          userId: { bsonType: 'objectId', description: 'User ID reference is required' },
          rating: { bsonType: 'int', minimum: 1, maximum: 5, description: 'Rating must be between 1 and 5' },
          comment: { bsonType: 'string', description: 'Comment is required' },
          serviceType: {
            bsonType: 'string',
            enum: ['dine_in', 'takeaway', 'delivery']
          },
          isApproved: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },
  payments: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'orderId', 'amount', 'paymentMethod'],
        properties: {
          userId: { bsonType: 'objectId', description: 'User ID reference is required' },
          orderId: { bsonType: 'objectId', description: 'Order ID reference is required' },
          amount: { bsonType: 'double', minimum: 0, description: 'Amount must be positive' },
          paymentMethod: {
            bsonType: 'string',
            enum: ['cash', 'card', 'online', 'wallet'],
            description: 'Payment method is required'
          },
          paymentStatus: {
            bsonType: 'string',
            enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled']
          },
          transactionId: { bsonType: 'string' },
          paymentDate: { bsonType: 'date' },
          cardLastFour: { bsonType: 'string' },
          cardType: {
            bsonType: 'string',
            enum: ['visa', 'mastercard', 'amex', 'other']
          },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  },
  restaurant_info: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'address', 'contact'],
        properties: {
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          address: {
            bsonType: 'object',
            required: ['street', 'city', 'state', 'zipCode', 'country'],
            properties: {
              street: { bsonType: 'string' },
              city: { bsonType: 'string' },
              state: { bsonType: 'string' },
              zipCode: { bsonType: 'string' },
              country: { bsonType: 'string' }
            }
          },
          contact: {
            bsonType: 'object',
            required: ['phone', 'email'],
            properties: {
              phone: { bsonType: 'string' },
              email: { bsonType: 'string' }
            }
          },
          operatingHours: { bsonType: 'object' },
          cuisineType: { bsonType: 'string' },
          priceRange: { bsonType: 'string', enum: ['$', '$$', '$$$', '$$$$'] },
          capacity: { bsonType: 'int' },
          deliveryFee: { bsonType: 'double' },
          minimumOrder: { bsonType: 'double' },
          taxRate: { bsonType: 'double' },
          logo: { bsonType: 'string' },
          images: { bsonType: 'array', items: { bsonType: 'string' } },
          socialLinks: {
            bsonType: 'object',
            properties: {
              facebook: { bsonType: 'string' },
              instagram: { bsonType: 'string' },
              twitter: { bsonType: 'string' }
            }
          },
          isActive: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  }
};

const setupCollections = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    console.log('Starting MongoDB collection setup...\n');

    for (const [collectionName, validator] of Object.entries(collectionValidators)) {
      try {
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length === 0) {
          // Create collection with validator
          await db.createCollection(collectionName, validator);
          console.log(`✓ Created collection: ${collectionName}`);
        } else {
          // Update existing collection with validator
          await db.command({
            collMod: collectionName,
            ...validator
          });
          console.log(`✓ Updated collection: ${collectionName}`);
        }
      } catch (err) {
        console.error(`✗ Error with collection ${collectionName}:`, err.message);
      }
    }

    console.log('\nCollection setup completed!');
    console.log('\nVerifying collections:');
    const allCollections = await db.listCollections().toArray();
    allCollections.forEach(col => console.log(`  - ${col.name}`));

    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
};

setupCollections();
