export const createItem = async (req, res) => {
  try {
    console.log('📥 Create item request received');
    console.log('📥 Body:', req.body);
    console.log('📥 Files:', req.files?.length || 0);

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
      displayOrder,
      rating,
      healthBenefits,
      preparationSteps,
      isAvailable,
      isFeatured,
      isPopular,
      ingredients,
      allergens,
      tags,
      nutritionInfo
    } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    // ✅ FIX: Only check category if categoryId is provided and not empty
    if (categoryId && categoryId.trim() !== '') {
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

    // ✅ FIX: Safe JSON parsing - handle empty strings and invalid JSON
    const safeJsonParse = (value, defaultValue = []) => {
      if (!value || value.trim() === '') return defaultValue;
      try {
        return JSON.parse(value);
      } catch (e) {
        console.warn('Failed to parse JSON:', value);
        return defaultValue;
      }
    };

    const parsedIngredients = safeJsonParse(ingredients, []);
    const parsedAllergens = safeJsonParse(allergens, []);
    const parsedTags = safeJsonParse(tags, []);
    const parsedNutrition = safeJsonParse(nutritionInfo, {});
    const parsedHealthBenefits = safeJsonParse(healthBenefits, []);
    const parsedPreparationSteps = safeJsonParse(preparationSteps, []);

    // Create item
    const item = await Item.create({
      name,
      description,
      // ✅ FIX: Only set categoryId if it's provided and not empty
      categoryId: (categoryId && categoryId.trim() !== '') ? categoryId : null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      images,
      type: type || 'veg',
      spiceLevel: spiceLevel || 'none',
      servingSize,
      preparationTime: preparationTime ? Number(preparationTime) : undefined,
      calories: calories ? Number(calories) : undefined,
      ingredients: parsedIngredients,
      allergens: parsedAllergens,
      tags: parsedTags,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      nutritionInfo: {
        protein: parsedNutrition?.protein ?? null,
        carbs: parsedNutrition?.carbs ?? null,
        fat: parsedNutrition?.fat ?? null,
        fiber: parsedNutrition?.fiber ?? null,
        calories: parsedNutrition?.calories ?? null,
        sugar: parsedNutrition?.sugar ?? null,
        sodium: parsedNutrition?.sodium ?? null,
      },
      rating: rating ?? 4.5,
      healthBenefits: parsedHealthBenefits,
      preparationSteps: parsedPreparationSteps,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : true,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' || isFeatured === true : false,
      isPopular: isPopular !== undefined ? isPopular === 'true' || isPopular === true : false,
      createdBy: req.user._id
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
