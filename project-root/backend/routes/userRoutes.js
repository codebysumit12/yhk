import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', registerUser); // POST /api/users - Register new user
router.post('/login', loginUser); // POST /api/users/login - Login user

// Private routes
router.get('/profile', protect, getUserProfile); // GET /api/users/profile - Get user profile
router.get('/', protect, getAllUsers); // GET /api/users - Get all users (admin only)
router.get('/:id', protect, getUserById); // GET /api/users/:id - Get user by ID
router.put('/:id', protect, updateUser); // PUT /api/users/:id - Update user (admin only)
router.delete('/:id', protect, deleteUser); // DELETE /api/users/:id - Delete user (admin only)

export default router;

