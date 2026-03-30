import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    console.log('🔍 getCategories called with query:', req.query);
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Request URL:', req.url);
    
    // Simple test - return all categories without item count
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 });
    console.log('🔍 Found categories:', categories.length);
    
    // Log each category for debugging
    categories.forEach(cat => {
      console.log('🔍 Category:', cat.name, 'isActive:', cat.isActive, '_id:', cat._id);
    });
    
    const response = {
      success: true,
      count: categories.length,
      data: categories
    };
    
    console.log('🔍 Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single category with items
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    const items = await MenuItem.find({
      $or: [
        { categoryId: category._id },
        { category: category._id.toString() },
        { category: category.slug }
      ]
    }).sort({ displayOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        items
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const items = await MenuItem.find({
      $or: [
        { categoryId: category._id },
        { category: category._id.toString() },
        { category: category.slug }
      ],
      isAvailable: true
    }).sort({ displayOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        items
      }
    });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle-status
// @access  Admin
const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    // Handle FormData or JSON
    let categoryData;
    
    if (req.file || req.headers['content-type']?.includes('multipart/form-data')) {
      // FormData request with image upload
      let imageUrl = '';
      if (req.file) {
        // Image was uploaded, create URL
        imageUrl = `/uploads/${req.file.filename}`;
        console.log('📸 Image uploaded:', req.file.filename);
      }
      
      categoryData = {
        name: req.body.name,
        description: req.body.description || '',
        icon: req.body.icon || '📁',
        color: req.body.color || '#22c55e',
        displayOrder: req.body.displayOrder || 0,
        imageUrl: imageUrl || req.body.imageUrl || ''
      };
    } else {
      // JSON request
      categoryData = req.body;
    }
    
    const { name, description, icon, color, displayOrder, imageUrl } = categoryData;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }
    
    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || '📁',
      color: color || '#22c55e',
      displayOrder: displayOrder || 0,
      imageUrl: imageUrl || ''
    });
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    // Handle FormData or JSON
    let categoryData;
    
    if (req.file || req.headers['content-type']?.includes('multipart/form-data')) {
      // FormData request with image upload
      let imageUrl = '';
      if (req.file) {
        // Image was uploaded, create URL
        imageUrl = `/uploads/${req.file.filename}`;
        console.log('📸 Image uploaded for update:', req.file.filename);
      }
      
      categoryData = {
        name: req.body.name,
        description: req.body.description || '',
        icon: req.body.icon || '📁',
        color: req.body.color || '#22c55e',
        displayOrder: req.body.displayOrder || 0,
        imageUrl: imageUrl || req.body.imageUrl || '',
        isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : undefined
      };
    } else {
      // JSON request
      categoryData = req.body;
    }
    
    const { name, description, icon, color, displayOrder, imageUrl, isActive } = categoryData;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Check if name is being changed and if it already exists
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }
    
    const updateData = {
      name: name ? name.trim() : category.name,
      description: description !== undefined ? description : category.description,
      icon: icon !== undefined ? icon : category.icon,
      color: color !== undefined ? color : category.color,
      displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder,
      imageUrl: imageUrl !== undefined ? imageUrl : category.imageUrl
    };
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Check if category has items
    const itemCount = await MenuItem.countDocuments({
      $or: [
        { categoryId: category._id },
        { category: category._id.toString() },
        { category: category.slug }
      ]
    });
    if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with items. Remove items first.'
      });
    }
    
    // Delete image from Cloudinary if exists
    if (category.imageUrl) {
      const publicId = category.imageUrl.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      } catch (cloudError) {
        console.error('Error deleting image from Cloudinary:', cloudError);
      }
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Upload category image
// @route   POST /api/categories/upload
// @access  Private (Admin)
const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image'
      });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories',
      resource_type: 'image'
    });
    
    res.json({
      success: true,
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Error uploading image'
    });
  }
};

export {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  uploadCategoryImage
};
