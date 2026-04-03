import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  image: {
    url: String,
    cloudinaryId: String
  },
  
  nutritionPer100g: {
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    fiber: {
      type: Number,
      min: 0
    },
    sugar: {
      type: Number,
      min: 0
    },
    sodium: {
      type: Number,
      min: 0
    }
  },
  
  allergens: [{
    type: String,
    trim: true
  }],
  
  dietaryInfo: {
    isVegan: {
      type: Boolean,
      default: false
    },
    isVegetarian: {
      type: Boolean,
      default: true
    },
    isGlutenFree: {
      type: Boolean,
      default: true
    },
    isDairyFree: {
      type: Boolean,
      default: true
    },
    isNutFree: {
      type: Boolean,
      default: true
    }
  },
  
  origin: {
    type: String,
    trim: true
  },
  
  season: [{
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'year-round']
  }],
  
  storageInstructions: {
    type: String,
    trim: true
  },
  
  shelfLife: {
    type: String,
    trim: true
  },
  
  averagePrice: {
    type: Number,
    min: 0
  },
  
  unit: {
    type: String,
    enum: ['kg', 'g', 'liter', 'ml', 'piece', 'bunch', 'cup', 'tbsp', 'tsp'],
    default: 'g'
  },
  
  isOrganic: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  usageCount: {
    type: Number,
    default: 0
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  healthBenefits: [{
    type: String,
    trim: true
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true
});

// Generate slug from name before saving
ingredientSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
ingredientSchema.index({ slug: 1 });
ingredientSchema.index({ category: 1, isActive: 1 });
ingredientSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Ingredient', ingredientSchema);