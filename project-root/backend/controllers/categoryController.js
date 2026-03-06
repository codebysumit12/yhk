import Category from '../models/Category.js';
import Item from '../models/Item.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Upload category image to Cloudinary
const uploadToCloudinary = async (file) => {
  const options = {
    folder: 'yhk-categories',
    transformation: [
      { width: 500, height: 500, crop: 'fill' }
    ]
  };

  const result = await cloudinary.uploader.upload(file.path, options);

  // Delete temp file
  fs.unlinkSync(file.path);

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, displayOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    let imageUrl = null;
    let cloudinaryId = null;

    // Upload image if provided
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file);
      imageUrl = uploadResult.url;
      cloudinaryId = uploadResult.publicId;
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category-' + Date.now();

    // Create category
    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || '📁',
      color: color || '#22c55e',
      imageUrl,
      cloudinaryId,
      displayOrder: displayOrder || 0,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    // Clean up file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description, icon, color, displayOrder, isActive } = req.body;

    // Check if new name conflicts with another category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (category.cloudinaryId) {
        await cloudinary.uploader.destroy(category.cloudinaryId);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(req.file);
      category.imageUrl = uploadResult.url;
      category.cloudinaryId = uploadResult.publicId;
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has items
    if (category.itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing items. Please move or delete items first.'
      });
    }

    // Delete image from Cloudinary if exists
    if (category.cloudinaryId) {
      await cloudinary.uploader.destroy(category.cloudinaryId);
    }

    // Delete category
    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle
// @access  Private/Admin
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update category item count
// @route   PATCH /api/categories/:id/item-count
// @access  Private
export const updateItemCount = async (req, res) => {
  try {
    const { increment } = req.body; // true to add, false to subtract

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (increment) {
      category.itemCount += 1;
    } else {
      category.itemCount = Math.max(0, category.itemCount - 1);
    }

    await category.save();

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};