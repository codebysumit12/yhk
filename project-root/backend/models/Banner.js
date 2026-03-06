import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required']
  },
  
  cloudinaryId: {
    type: String,
    required: true
  },
  
  thumbnailUrl: {
    type: String // For video thumbnails
  },
  
  position: {
    type: String,
    enum: ['hero', 'menu-hero', 'about', 'footer', 'popup'],
    default: 'hero'
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  link: {
    type: String,
    trim: true
  },
  
  linkText: {
    type: String,
    trim: true
  },
  
  overlayText: {
    title: String,
    subtitle: String,
    buttonText: String
  },
  
  dimensions: {
    width: Number,
    height: Number
  },
  
  fileSize: {
    type: Number // in bytes
  },
  
  duration: {
    type: Number // for videos in seconds
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true
});

// Index for faster queries
bannerSchema.index({ position: 1, isActive: 1, displayOrder: 1 });

export default mongoose.model('Banner', bannerSchema);