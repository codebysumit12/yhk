import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5 // Default rating
  },
  
  healthBenefits: [{
    type: String,
    trim: true
  }],
  
  preparationSteps: [{
    type: String,
    trim: true,
    maxlength: [500, 'Step cannot exceed 500 characters']
  }],
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  
  images: [{
    url: String,
    cloudinaryId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  type: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'egg'],
    default: 'veg'
  },
  
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'extra-hot'],
    default: 'none'
  },
  
  servingSize: {
    type: String,
    trim: true
  },
  
  preparationTime: {
    type: Number, // in minutes
    min: [0, 'Preparation time cannot be negative']
  },
  
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  
  ingredients: [{
    type: String,
    trim: true
  }],
  
  allergens: [{
    type: String,
    trim: true
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isPopular: {
    type: Boolean,
    default: false
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  nutritionInfo: {
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    calories: Number,
    sugar: Number,
    sodium: Number
  },
  
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  soldCount: {
    type: Number,
    default: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Generate slug from name before saving
itemSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Update category item count when item is created
itemSchema.post('save', async function() {
  const Category = mongoose.model('Category');
  const count = await mongoose.model('Item').countDocuments({ 
    category: this.category,
    isAvailable: true 
  });
  await Category.findByIdAndUpdate(this.category, { itemCount: count });
});

// Update category item count when item is deleted
itemSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Category = mongoose.model('Category');
  const count = await mongoose.model('Item').countDocuments({ 
    category: this.category,
    isAvailable: true 
  });
  await Category.findByIdAndUpdate(this.category, { itemCount: count });
});

// Indexes
itemSchema.index({ slug: 1 });
itemSchema.index({ category: 1, isAvailable: 1 });
itemSchema.index({ name: 'text', description: 'text', tags: 'text' });
itemSchema.index({ price: 1 });
itemSchema.index({ isFeatured: 1, isPopular: 1 });

export default mongoose.model('Item', itemSchema);