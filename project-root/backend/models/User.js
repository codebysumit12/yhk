import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: function() {
      return !this.firebaseUid; // Only required if not using Firebase
    }, 
    unique: true, 
    sparse: true, // Allows multiple null values for unique constraint
    lowercase: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: function() {
      return !this.firebaseUid; // Only required if not using Firebase
    }, 
    unique: true, 
    sparse: true, // Allows multiple null values for unique constraint
    trim: true 
  },
  password: { 
    type: String, 
    required: function() {
      return !this.firebaseUid; // Only required if not using Firebase
    }, 
    minlength: 6, 
    select: false 
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  addresses: [{
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    landmark: String,
    isDefault: { type: Boolean, default: false }
  }],
  preferences: {
    dietary: [String],
    allergies: [String],
    spiceLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;