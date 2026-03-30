import MenuItem from '../models/MenuItem.js';
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
    console.log('🔍 getItems called with query:', req.query);
    
    const { 
      category, 
      categoryId,
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
    
    if (categoryId) {
      filter.categoryId = categoryId;
    } else if (category) {
      filter.category = category;
    }
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

    const items = await MenuItem.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await MenuItem.countDocuments(filter);

    res.json({
      success: true,
      count: items.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: items
    });
  } catch (error) {
    console.error('❌ getItems error:', error.message);
    console.error('❌ Full error:', error);
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
    const item = await MenuItem.findById(req.params.id)
      .populate('categoryId', 'name slug icon color')
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
    const item = await MenuItem.findOne({ slug: req.params.slug })
      .populate('categoryId', 'name slug icon color')
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
    const { isAvailable } = req.query;

    // Build filter
    const filter = { categoryId: categoryId };
    
    // Only add isAvailable filter if explicitly provided
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    const items = await MenuItem.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('categoryId', 'name slug icon color');

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
    console.log('🔍 Request body keys:', Object.keys(req.body));
    console.log('🔍 Request body:', req.body);
    console.log('🔍 Name from body:', req.body.name);
    
    const {
      name,
      description,
      categoryId,
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
      nutritionInfo,
      healthBenefits, preparationSteps,
      isAvailable, isFeatured, isPopular,
    } = req.body;

    // Comprehensive validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    if (!categoryId || categoryId === '') {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    if (!type || type === '') {
      return res.status(400).json({
        success: false,
        message: 'Item type is required'
      });
    }

    console.log('📝 Creating item:', name);
    console.log('📁 Files received:', req.files?.length || 0);

    // Check if category exists (only if categoryId provided)
    if (categoryId && categoryId !== '') {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        // Clean up uploaded files
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Upload images
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        console.log('📤 Uploading to Cloudinary...');
        const uploadedImages = await uploadImagesToCloudinary(req.files);
        images = uploadedImages.map((img, index) => ({
          url: img.url,
          cloudinaryId: img.cloudinaryId,
          isPrimary: index === 0
        }));
        console.log('✅ Images uploaded:', images.length);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        
        // Clean up temp files
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images: ' + uploadError.message
        });
      }
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }
    
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }
    
    if (!price || price === '' || isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    // Parse arrays if they're strings
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    const parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    const parsedNutrition = typeof nutritionInfo === 'string' ? JSON.parse(nutritionInfo) : nutritionInfo;
    const parsedHealthBenefits = typeof healthBenefits === 'string' ? JSON.parse(healthBenefits) : healthBenefits;
    const parsedPreparationSteps = typeof preparationSteps === 'string' ? JSON.parse(preparationSteps) : preparationSteps;

    // Create item
    const item = await MenuItem.create({
      name,
      description,
      categoryId: categoryId && categoryId !== '' ? categoryId : null,
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
      nutritionInfo: {
        protein:  parsedNutrition?.protein  ?? null,
        carbs:    parsedNutrition?.carbs    ?? null,
        fat:      parsedNutrition?.fat      ?? null,
        fiber:    parsedNutrition?.fiber    ?? null,
        calories: parsedNutrition?.calories ?? null,  // ← new
        sugar:    parsedNutrition?.sugar    ?? null,  // ← new
        sodium:   parsedNutrition?.sodium   ?? null,  // ← new
      },
      healthBenefits:   parsedHealthBenefits   || [],
      preparationSteps: parsedPreparationSteps || [],
      isAvailable:      isAvailable === 'true' || isAvailable === true,
      isFeatured:       isFeatured === 'true' || isFeatured === true,
      isPopular:        isPopular === 'true' || isPopular === true,
      
      createdBy: req.user._id,
     
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('❌ Create item error:', error);
    
    // Clean up files
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', file.path);
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
    const item = await MenuItem.findById(req.params.id);

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
        // Handle new schema with images array
        const deletePromises = item.images.map(img => {
          // Handle both field names: cloudinaryId (from upload) and publicId (from schema)
          const publicIdToDelete = img.cloudinaryId || img.publicId;
          if (publicIdToDelete && typeof publicIdToDelete === 'string' && publicIdToDelete.trim() !== '') {
            return cloudinary.uploader.destroy(publicIdToDelete);
          }
          return Promise.resolve(); // Skip if no valid publicId
        });
        await Promise.all(deletePromises);
      } else if (item.imageUrl && item.imageUrl.trim() !== '') {
        // Handle old schema with single imageUrl
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = item.imageUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = filename.split('.')[0];
          if (publicId && typeof publicId === 'string' && publicId.trim() !== '') {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (error) {
          console.log('Failed to delete old image:', error.message);
          // Continue with update even if image deletion fails
        }
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
      nutritionInfo,
      healthBenefits,
     preparationSteps,
  
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
      item.categoryId = category;
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
    if (isAvailable !== undefined) item.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (isFeatured !== undefined) item.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isPopular !== undefined) item.isPopular = isPopular === 'true' || isPopular === true;
    if (displayOrder !== undefined) item.displayOrder = Number(displayOrder);
    if (nutritionInfo) { 
      const parsed = typeof nutritionInfo === 'string' ? JSON.parse(nutritionInfo) : nutritionInfo;
      item.nutritionInfo = {
        protein:  parsed.protein  ?? item.nutritionInfo?.protein,
        carbs:    parsed.carbs    ?? item.nutritionInfo?.carbs,
        fat:      parsed.fat      ?? item.nutritionInfo?.fat,
        fiber:    parsed.fiber    ?? item.nutritionInfo?.fiber,
        calories: parsed.calories ?? item.nutritionInfo?.calories,
        sugar:    parsed.sugar    ?? item.nutritionInfo?.sugar,
        sodium:   parsed.sodium   ?? item.nutritionInfo?.sodium,
      };
    }

    if (healthBenefits !== undefined) item.healthBenefits = typeof healthBenefits === 'string' ? JSON.parse(healthBenefits) : healthBenefits;
    if (preparationSteps !== undefined) item.preparationSteps = typeof preparationSteps === 'string' ? JSON.parse(preparationSteps) : preparationSteps;

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
    console.log('Delete request for item:', req.params.id);
    
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    console.log('Found item:', item.name);

    // Skip Cloudinary deletion for now to isolate the crash
    console.log('Skipping Cloudinary deletion for debugging');

    // Delete item from database
    await item.deleteOne();
    console.log('Item deleted from database');

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
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
    const item = await MenuItem.findById(req.params.id);

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
    const item = await MenuItem.findById(req.params.id);

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
    const item = await MenuItem.findById(req.params.id);

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
