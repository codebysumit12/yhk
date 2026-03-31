import express from 'express';
import {
  getIngredients,
  getIngredientById,
  getIngredientBySlug,
  getIngredientsByCategory,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  toggleIngredientStatus
} from '../controllers/ingredientController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getIngredients);
router.get('/:id', getIngredientById);
router.get('/slug/:slug', getIngredientBySlug);
router.get('/category/:category', getIngredientsByCategory);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, upload.single('image'), createIngredient);
router.put('/:id', protect, adminOnly, upload.single('image'), updateIngredient);
router.delete('/:id', protect, adminOnly, deleteIngredient);
router.patch('/:id/toggle', protect, adminOnly, toggleIngredientStatus);

export default router;