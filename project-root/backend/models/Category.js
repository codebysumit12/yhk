import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  icon: {
    type: String,
    default: '📁'
  },
  
  color: {
    type: String,
    default: '#22c55e'
  },
  
  imageUrl: {
    type: String
  },
  
  cloudinaryId: {
    type: String
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  itemCount: {
    type: Number,
    default: 0
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
  
}, {
  timestamps: true
});

// Update timestamp on save
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'category-' + Date.now();
    } else {
      this.slug = 'category-' + Date.now();
    }
  }
  next();
});

// Index for faster queries
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model('Category', categorySchema);