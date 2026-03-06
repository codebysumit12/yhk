import Ingredient from '../models/Ingredient.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'yhk-ingredients',
    transformation: [
      { width: 500, height: 500, crop: 'fill', quality: 'auto' }
    ]
  });

  // Delete temp file
  fs.unlinkSync(file.path);

  return {
    url: result.secure_url,
    cloudinaryId: result.public_id
  };
};

// @desc    Get all ingredients
// @route   GET /api/ingredients
// @access  Public
export const getIngredients = async (req, res) => {
  try {
    const { 
      category, 
      isActive,
      isVegan,
      isVegetarian,
      isGlutenFree,
      search,
      sort = 'name',
      page = 1,
      limit = 50
    } = req.query;
    
    const filter = {};
    
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isVegan !== undefined) filter['dietaryInfo.isVegan'] = isVegan === 'true';
    if (isVegetarian !== undefined) filter['dietaryInfo.isVegetarian'] = isVegetarian === 'true';
    if (isGlutenFree !== undefined) filter['dietaryInfo.isGlutenFree'] = isGlutenFree === 'true';
    
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const ingredients = await Ingredient.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .populate('createdBy', 'name email');

    const total = await Ingredient.countDocuments(filter);

    res.json({
      success: true,
      count: ingredients.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single ingredient
// @route   GET /api/ingredients/:id
// @access  Public
export const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get ingredient by slug
// @route   GET /api/ingredients/slug/:slug
// @access  Public
export const getIngredientBySlug = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ slug: req.params.slug })
      .populate('createdBy', 'name email');

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    res.json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new ingredient
// @route   POST /api/ingredients
// @access  Private/Admin
export const createIngredient = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      nutritionPer100g,
      allergens,
      dietaryInfo,
      origin,
      season,
      storageInstructions,
      shelfLife,
      averagePrice,
      unit,
      isOrganic,
      displayOrder,
      tags,
      healthBenefits
    } = req.body;

    // Check if ingredient already exists
    const existingIngredient = await Ingredient.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingIngredient) {
      return res.status(400).json({
        success: false,
        message: 'Ingredient with this name already exists'
      });
    }

    // Upload image if provided
    let image = null;
    if (req.file) {
      image = await uploadToCloudinary(req.file);
    }

    // Parse JSON fields if they're strings
    const parsedNutrition = typeof nutritionPer100g === 'string' ? JSON.parse(nutritionPer100g) : nutritionPer100g;
    const parsedAllergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    const parsedDietary = typeof dietaryInfo === 'string' ? JSON.parse(dietaryInfo) : dietaryInfo;
    const parsedSeason = typeof season === 'string' ? JSON.parse(season) : season;
    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    const parsedBenefits = typeof healthBenefits === 'string' ? JSON.parse(healthBenefits) : healthBenefits;

    // Create ingredient
    const ingredient = await Ingredient.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description,
      category: category || 'other',
      image,
      nutritionPer100g: parsedNutrition || {},
      allergens: parsedAllergens || [],
      dietaryInfo: parsedDietary || {},
      origin,
      season: parsedSeason || [],
      storageInstructions,
      shelfLife,
      averagePrice: averagePrice ? Number(averagePrice) : undefined,
      unit: unit || 'g',
      isOrganic: isOrganic === 'true' || isOrganic === true,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      tags: parsedTags || [],
      healthBenefits: parsedBenefits || [],
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      data: ingredient
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

// @desc    Update ingredient
// @route   PUT /api/ingredients/:id
// @access  Private/Admin
export const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    // Check if new name conflicts with another ingredient
    const {
      name,
      description,
      category,
      nutritionPer100g,
      allergens,
      dietaryInfo,
      origin,
      season,
      storageInstructions,
      shelfLife,
      averagePrice,
      unit,
      isOrganic,
      isActive,
      displayOrder,
      tags,
      healthBenefits
    } = req.body;

    if (name && name !== ingredient.name) {
      const existingIngredient = await Ingredient.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: ingredient._id }
      });

      if (existingIngredient) {
        return res.status(400).json({
          success: false,
          message: 'Ingredient with this name already exists'
        });
      }
    }

    // Handle image update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (ingredient.image?.cloudinaryId) {
        await cloudinary.uploader.destroy(ingredient.image.cloudinaryId);
      }

      // Upload new image
      ingredient.image = await uploadToCloudinary(req.file);
    }

    // Update fields
    if (name) ingredient.name = name;
    if (description !== undefined) ingredient.description = description;
    if (category) ingredient.category = category;
    if (origin !== undefined) ingredient.origin = origin;
    if (storageInstructions !== undefined) ingredient.storageInstructions = storageInstructions;
    if (shelfLife !== undefined) ingredient.shelfLife = shelfLife;
    if (averagePrice !== undefined) ingredient.averagePrice = averagePrice ? Number(averagePrice) : null;
    if (unit) ingredient.unit = unit;
    if (isOrganic !== undefined) ingredient.isOrganic = isOrganic === 'true' || isOrganic === true;
    if (isActive !== undefined) ingredient.isActive = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) ingredient.displayOrder = Number(displayOrder);

    // Update complex fields
    if (nutritionPer100g) {
      ingredient.nutritionPer100g = typeof nutritionPer100g === 'string' ? JSON.parse(nutritionPer100g) : nutritionPer100g;
    }
    if (allergens) {
      ingredient.allergens = typeof allergens === 'string' ? JSON.parse(allergens) : allergens;
    }
    if (dietaryInfo) {
      ingredient.dietaryInfo = typeof dietaryInfo === 'string' ? JSON.parse(dietaryInfo) : dietaryInfo;
    }
    if (season) {
      ingredient.season = typeof season === 'string' ? JSON.parse(season) : season;
    }
    if (tags) {
      ingredient.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (healthBenefits) {
      ingredient.healthBenefits = typeof healthBenefits === 'string' ? JSON.parse(healthBenefits) : healthBenefits;
    }

    await ingredient.save();

    res.json({
      success: true,
      message: 'Ingredient updated successfully',
      data: ingredient
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

// @desc    Delete ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private/Admin
export const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    // Delete image from Cloudinary if exists
    if (ingredient.image?.cloudinaryId) {
      await cloudinary.uploader.destroy(ingredient.image.cloudinaryId);
    }

    // Delete ingredient
    await ingredient.deleteOne();

    res.json({
      success: true,
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle ingredient active status
// @route   PATCH /api/ingredients/:id/toggle
// @access  Private/Admin
export const toggleIngredientStatus = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }

    ingredient.isActive = !ingredient.isActive;
    await ingredient.save();

    res.json({
      success: true,
      message: `Ingredient ${ingredient.isActive ? 'activated' : 'deactivated'}`,
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get ingredients by category
// @route   GET /api/ingredients/category/:category
// @access  Public
export const getIngredientsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { isActive = 'true' } = req.query;

    const ingredients = await Ingredient.find({ 
      category,
      isActive: isActive === 'true'
    })
      .sort({ name: 1 });

    res.json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};