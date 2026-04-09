import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    ref: 'Category'
  },
  image: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 15
  },
  dietary: [{
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free']
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    trim: true
  }],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: 'medium'
  },
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Item', ItemSchema);
