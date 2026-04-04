import express from 'express';
import { searchItems, getItemById, getPopularItems } from '../controllers/searchController.js';
const router = express.Router();

// GET /api/search?q=... - Search items
router.get('/search', searchItems);

// GET /api/item/:id - Get single item details
router.get('/item/:id', getItemById);

// GET /api/popular-items - Get popular items for suggestions
router.get('/popular-items', getPopularItems);

export default router;
