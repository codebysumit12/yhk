import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getAllUsers 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', registerUser); // POST /api/users - Register new user
router.post('/login', loginUser); // POST /api/users/login - Login user

// Private routes
router.get('/profile', protect, getUserProfile); // GET /api/users/profile - Get user profile
router.get('/', protect, getAllUsers); // GET /api/users - Get all users (admin only)

export default router;

