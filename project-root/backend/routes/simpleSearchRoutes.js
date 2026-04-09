import express from 'express';
import { simpleSearchItems, simpleGetItemById } from '../controllers/simpleSearchController.js';
const router = express.Router();

// GET /api/simple-search?q=... - Simple search using existing items API
router.get('/simple-search', simpleSearchItems);

// GET /api/simple-item/:id - Get item using existing items API
router.get('/simple-item/:id', simpleGetItemById);

export default router;
