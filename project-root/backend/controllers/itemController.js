import Item from '../models/Item.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Upload images to Cloudinary
const uploadImagesToCloudinary = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'yhk-items',
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto' }
      ]
    });

    // Delete temp file
    fs.unlinkSync(file.path);

    return {
      url: result.secure_url,
      cloudinaryId: result.public_id
    };
  });

  return await Promise.all(uploadPromises);
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const { 
      category, 
      type, 
      isAvailable, 
      isFeatured, 
      isPopular,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;
    
    const filter = {};
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true';
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const items = await Item.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .populate('category', 'name slug icon color')
      .populate('createdBy', 'name email');

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      count: items.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('category', 'name slug icon color')
      .populate('createdBy', 'name email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get item by slug
// @route   GET /api/items/slug/:slug
// @access  Public
export const getItemBySlug = async (req, res) => {
  try {
    const item = await Item.findOne({ slug: req.params.slug })
      .populate('category', 'name slug icon color')
      .populate('createdBy', 'name email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get items by category
// @route   GET /api/items/category/:categoryId
// @access  Public
export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { isAvailable = true } = req.query;

    const items = await Item.find({ 
      category: categoryId,
      isAvailable: isAvailable === 'true'
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('category', 'name slug icon color');

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private/Admin
export const createItem = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      type,
      spiceLevel,
      servingSize,
      preparationTime,
      calories,
      ingredients,
      allergens,
      tags,
      displayOrder,
      nutritionInfo
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Upload images if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadImagesToCloudinary(req.files);
      images = uploadedImages.map((img, index) => ({
        ...img,
        isPrimary: index === 0
      }));
    }

    // Parse arrays if they're strings
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    const parsedNutrition = typeof nutritionInfo === 'string' ? JSON.parse(nutritionInfo) : nutritionInfo;

    // Create item
    const item = await Item.create({
      name,
      description,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      images,
      type: type || 'veg',
      spiceLevel: spiceLevel || 'none',
      servingSize,
      preparationTime: preparationTime ? Number(preparationTime) : undefined,
      calories: calories ? Number(calories) : undefined,
      ingredients: parsedIngredients || [],
      allergens: parsedAllergens || [],
      tags: parsedTags || [],
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      nutritionInfo: parsedNutrition,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    // Clean up files if upload fails
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (item.images && item.images.length > 0) {
        const deletePromises = item.images.map(img => 
          cloudinary.uploader.destroy(img.cloudinaryId)
        );
        await Promise.all(deletePromises);
      }

      // Upload new images
      const uploadedImages = await uploadImagesToCloudinary(req.files);
      item.images = uploadedImages.map((img, index) => ({
        ...img,
        isPrimary: index === 0
      }));
    }

    // Update fields
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      type,
      spiceLevel,
      servingSize,
      preparationTime,
      calories,
      ingredients,
      allergens,
      tags,
      isAvailable,
      isFeatured,
      isPopular,
      displayOrder,
      nutritionInfo
    } = req.body;

    if (name) item.name = name;
    if (description) item.description = description;
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      item.category = category;
    }
    if (price !== undefined) item.price = Number(price);
    if (discountPrice !== undefined) item.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (type) item.type = type;
    if (spiceLevel) item.spiceLevel = spiceLevel;
    if (servingSize !== undefined) item.servingSize = servingSize;
    if (preparationTime !== undefined) item.preparationTime = preparationTime ? Number(preparationTime) : null;
    if (calories !== undefined) item.calories = calories ? Number(calories) : null;
    if (ingredients) item.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    if (allergens) item.allergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    if (tags) item.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;
    if (isFeatured !== undefined) item.isFeatured = isFeatured;
    if (isPopular !== undefined) item.isPopular = isPopular;
    if (displayOrder !== undefined) item.displayOrder = Number(displayOrder);
    if (nutritionInfo) item.nutritionInfo = typeof nutritionInfo === 'string' ? JSON.parse(nutritionInfo) : nutritionInfo;

    await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Delete images from Cloudinary
    if (item.images && item.images.length > 0) {
      const deletePromises = item.images.map(img => 
        cloudinary.uploader.destroy(img.cloudinaryId)
      );
      await Promise.all(deletePromises);
    }

    // Delete item
    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle item availability
// @route   PATCH /api/items/:id/toggle-availability
// @access  Private/Admin
export const toggleItemAvailability = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `Item ${item.isAvailable ? 'is now available' : 'marked as unavailable'}`,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/items/:id/toggle-featured
// @access  Private/Admin
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    item.isFeatured = !item.isFeatured;
    await item.save();

    res.json({
      success: true,
      message: `Item ${item.isFeatured ? 'marked as featured' : 'removed from featured'}`,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Set primary image
// @route   PATCH /api/items/:id/set-primary-image
// @access  Private/Admin
export const setPrimaryImage = async (req, res) => {
  try {
    const { imageIndex } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (!item.images || item.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images found for this item'
      });
    }

    if (imageIndex < 0 || imageIndex >= item.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    // Set all images to non-primary
    item.images.forEach(img => img.isPrimary = false);
    
    // Set selected image as primary
    item.images[imageIndex].isPrimary = true;

    await item.save();

    res.json({
      success: true,
      message: 'Primary image updated',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
