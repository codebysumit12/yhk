import express from 'express';
import {
  getItems,
  getItemById,
  getItemBySlug,
  getItemsByCategory,
  createItem,
  updateItem,
  deleteItem,
  toggleItemAvailability,
  toggleFeaturedStatus,
  setPrimaryImage
} from '../controllers/itemController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/slug/:slug', getItemBySlug);
router.get('/category/:categoryId', getItemsByCategory);
router.get('/:id', getItemById);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, upload.array('images', 5), createItem);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateItem);
router.delete('/:id', protect, adminOnly, deleteItem);
router.patch('/:id/toggle-availability', protect, adminOnly, toggleItemAvailability);
router.patch('/:id/toggle-featured', protect, adminOnly, toggleFeaturedStatus);
router.patch('/:id/set-primary-image', protect, adminOnly, setPrimaryImage);

export default router;