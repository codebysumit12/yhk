import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Protect routes - verify JWT token
// @access  Private
export const protect = async (req, res, next) => {
  let token;

  console.log('Auth debug - Full auth header:', req.headers.authorization);
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('Auth debug - Token length:', token ? token.length : 'null');
      console.log('Auth debug - Token starts with:', token ? token.substring(0, 20) : 'null');
      console.log('Auth debug - Token ends with:', token ? token.substring(token.length - 20) : 'null');
      
      if (!token || token === 'null' || token === 'undefined') {
        console.log('Auth debug - Invalid token value');
        return res.status(401).json({
          success: false,
          error: 'Invalid token format'
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yhk_secret_key_2024');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log('Auth debug - User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      console.error('Auth error type:', error.name);
      res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  } else {
    console.log('No Bearer token in authorization header');
  }

  if (!token) {
    console.log('No token provided in authorization header');
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// @desc    Admin middleware
// @access  Private/Admin
export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin === true)) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Admin access required'
    });
  }
};

// @desc    Delivery partner middleware
// @access  Private/Delivery
export const deliveryBoy = (req, res, next) => {
  if (req.user && (req.user.role === 'delivery_partner' || req.user.role === 'admin' || req.user.isAdmin === true)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Not authorized as a delivery partner'
    });
  }
};
