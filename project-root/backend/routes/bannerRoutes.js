import express from 'express';
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} from '../controllers/bannerController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getBanners);
router.get('/:id', getBannerById);

// Protected routes (Admin only)
router.post('/', protect, adminOnly, upload.single('file'), createBanner);
router.put('/:id', protect, adminOnly, upload.single('file'), updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);
router.patch('/:id/toggle', protect, adminOnly, toggleBannerStatus);

export default router;