import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  category: {
    type: String,
    required: false,
    default: null
  },
  
  image: {
    type: String,
    required: false,
    default: ''
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  preparationTime: {
    type: Number,
    required: false,
    default: 15
  },
  
  isSpecial: {
    type: Boolean,
    default: false
  },
  
  // Add ratings field to match your data
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
  }
}, {
  timestamps: true
});

// Indexes
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1, isAvailable: 1 });
itemSchema.index({ price: 1 });

export default mongoose.model('Item', itemSchema, 'menuitems');
