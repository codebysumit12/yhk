
import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  uploadCategoryImage
} from '../controllers/categoryController.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', (req, res, next) => {
  console.log('🔍 Category route hit:', req.method, req.url, req.query);
  next();
}, getCategories);

// @route   GET /api/categories/slug/:slug
// @desc    Get category by slug
// @access  Public
router.get('/slug/:slug', getCategoryBySlug);

// @route   GET /api/categories/:id
// @desc    Get single category with items
// @access  Public
router.get('/:id', getCategoryById);

// @route   POST /api/categories
// @desc    Create a category
// @access  Private (Admin)
router.post('/', upload.single('image'), createCategory);

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/:id', upload.single('image'), updateCategory);

// @route   PATCH /api/categories/:id/toggle-status
// @desc    Toggle category active status
// @access  Private (Admin)
router.patch('/:id/toggle-status', toggleCategoryStatus);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/:id', deleteCategory);

// @route   POST /api/categories/upload
// @desc    Upload category image
// @access  Private (Admin)
router.post('/upload', upload.single('image'), uploadCategoryImage);

export default router;
