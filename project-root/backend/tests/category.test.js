import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

describe('Category Creation Tests', () => {
  let adminToken;
  let adminUser;

  beforeAll(async () => {
    // Create admin user for testing
    adminUser = new User({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    await adminUser.save();
    
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    
    adminToken = loginResponse.body.token;
  });

  beforeEach(async () => {
    // Clean up categories before each test
    await Category.deleteMany({});
  });

  afterAll(async () => {
    // Clean up
    await Category.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/categories', () => {
    it('should create a new category with valid data', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        icon: '🍕',
        color: '#22c55e',
        displayOrder: 1
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data.description).toBe(categoryData.description);
      expect(response.body.data.icon).toBe(categoryData.icon);
      expect(response.body.data.color).toBe(categoryData.color);
      expect(response.body.data.displayOrder).toBe(categoryData.displayOrder);
      expect(response.body.data.slug).toBe('test-category');
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.itemCount).toBe(0);
    });

    it('should reject category creation without authentication', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject category creation without admin privileges', async () => {
      // Create regular user
      const regularUser = new User({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'password123',
        role: 'user'
      });
      await regularUser.save();

      // Login regular user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });

      const userToken = loginResponse.body.token;

      const categoryData = {
        name: 'Test Category',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject category with duplicate name (case insensitive)', async () => {
      // Create first category
      const category1 = new Category({
        name: 'Pizza',
        slug: 'pizza',
        createdBy: adminUser._id
      });
      await category1.save();

      // Try to create duplicate
      const categoryData = {
        name: 'PIZZA', // Different case
        description: 'Duplicate category'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should handle category name with special characters correctly', async () => {
      const categoryData = {
        name: 'Pizza & Burgers!',
        description: 'Special characters test'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data.slug).toBe('pizza-burgers');
    });

    it('should reject category with empty name', async () => {
      const categoryData = {
        name: '',
        description: 'Empty name test'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should reject category with name exceeding 50 characters', async () => {
      const categoryData = {
        name: 'This is a very long category name that exceeds fifty characters limit',
        description: 'Long name test'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should set default values when not provided', async () => {
      const categoryData = {
        name: 'Minimal Category'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.icon).toBe('📁');
      expect(response.body.data.color).toBe('#22c55e');
      expect(response.body.data.displayOrder).toBe(0);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should create category with image upload', async () => {
      const categoryData = {
        name: 'Category with Image',
        description: 'Image upload test'
      };

      // Mock file upload
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .field('name', categoryData.name)
        .field('description', categoryData.description)
        .expect(201);

      expect(response.body.success).toBe(true);
      // Note: Image upload testing would require mocking Cloudinary
    });
  });

  describe('Category Validation Tests', () => {
    it('should validate description length', async () => {
      const longDescription = 'a'.repeat(201); // Exceeds 200 character limit
      const categoryData = {
        name: 'Test Category',
        description: longDescription
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should handle negative display order', async () => {
      const categoryData = {
        name: 'Test Category',
        displayOrder: -1
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.displayOrder).toBe(-1);
    });

    it('should generate unique slug for similar names', async () => {
      const category1Data = {
        name: 'Test Category'
      };

      const category2Data = {
        name: 'Test Category'
      };

      // Create first category
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(category1Data)
        .expect(201);

      // Try to create second with same name (should fail due to duplicate check)
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(category2Data)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
});
