import express from 'express';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get pricing configuration (public endpoint)
router.get('/pricing', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Create default if doesn't exist
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update pricing configuration
router.put('/pricing', protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;