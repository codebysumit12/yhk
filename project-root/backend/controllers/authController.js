import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'yhk_secret_key_2024', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'customer' // Default role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        addresses: user.addresses,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, preferences, addresses } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (addresses) user.addresses = addresses;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordCorrect = await user.matchPassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a JWT-based auth, logout is handled client-side by removing the token
    // But we can add logic here for token blacklisting if needed
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Firebase phone authentication
// @route   POST /api/auth/firebase-login
// @access  Public
export const firebaseLogin = async (req, res) => {
  try {
    const { uid, phone, name, email } = req.body;

    // Validation
    if (!uid || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID and phone number are required'
      });
    }

    console.log('Firebase login attempt:', { uid, phone: phone.replace(/\D/g, ''), name });

    // Normalize phone number (remove all non-digits)
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // Check if user exists with this Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if user exists with this phone number (without Firebase UID)
      user = await User.findOne({ phone: normalizedPhone });
      
      if (user) {
        // Update existing user with Firebase UID
        user.firebaseUid = uid;
        if (name && user.name !== name) user.name = name;
        if (email && user.email !== email) user.email = email;
        user.isPhoneVerified = true;
        user.isEmailVerified = true;
        await user.save();
        console.log('Updated existing user with Firebase UID:', user._id);
      } else {
        // Create new user
        try {
          user = new User({
            firebaseUid: uid,
            phone: normalizedPhone,
            name: name || 'User',
            email: email || `${uid}@firebase.user`, // Better temporary email format
            role: 'customer',
            isPhoneVerified: true,
            isEmailVerified: email ? true : false,
            isActive: true
          });
          
          await user.save();
          console.log('New Firebase user created successfully:', user._id);
        } catch (saveError) {
          console.error('User creation failed:', saveError);
          return res.status(500).json({
            success: false,
            message: 'User creation failed: ' + saveError.message,
            error: saveError.message
          });
        }
      }
    } else {
      // Update existing Firebase user if needed
      let needsUpdate = false;
      if (name && user.name !== name) {
        user.name = name;
        needsUpdate = true;
      }
      if (email && user.email !== email) {
        user.email = email;
        needsUpdate = true;
      }
      if (user.phone !== normalizedPhone) {
        user.phone = normalizedPhone;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        console.log('Updated existing Firebase user:', user._id);
      }
    }

    // Generate JWT token with consistent structure
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'yhk_secret_key_2024',
      { expiresIn: '7d' }
    );

    console.log('Firebase login successful for user:', user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin',
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};