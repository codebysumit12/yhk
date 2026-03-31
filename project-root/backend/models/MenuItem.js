import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    default: null
  },
  
  // Category - FIXED: supports both formats
  category: {
    type: String,
    required: false,
    default: null
  },
  
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
    default: null
  },
  
  // Images - FIXED: supports both single image and array
  image: {
    type: String,
    required: false,
    default: ''
  },
  
  images: [{
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  }],
  
  // Food Type & Details
  type: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'egg', 'drinks', 'beverages', 'smoothies', 'desserts'],
    default: 'veg'
  },
  
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot', 'none'],
    default: 'mild'
  },
  
  // Ingredients & Allergens
  ingredients: [{
    type: String
  }],
  
  allergens: [{
    type: String
  }],
  
  tags: [{
    type: String
  }],
  
  // Nutrition Info
  nutritionInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  
  // FIXED: Added top-level calories for backward compatibility
  calories: {
    type: Number,
    default: 0
  },
  
  servingSize: {
    type: String,
    default: '1 serving'
  },
  
  // Health Benefits
  healthBenefits: [{
    type: String
  }],
  
  // Preparation
  preparationTime: {
    type: Number,
    required: false,
    default: 15
  },
  
  preparationSteps: [{
    type: String
  }],
  
  // Availability & Status
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  isSpecial: {
    type: Boolean,
    default: false
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
  
  // Ratings & Stats
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ categoryId: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ slug: 1 });
menuItemSchema.index({ type: 1 });
menuItemSchema.index({ isFeatured: 1, isPopular: 1 });

// Pre-save hook to generate slug
menuItemSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual for final price (discounted or regular)
menuItemSchema.virtual('finalPrice').get(function() {
  return this.discountPrice || this.price;
});

// Ensure virtuals are included in JSON
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

export default mongoose.model('MenuItem', menuItemSchema, 'items');
