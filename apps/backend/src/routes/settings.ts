import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSetting } from '../controllers/settingsController.js';

const router = express.Router();

// Publicly accessible settings (for forms)
router.get('/', getSettings);

// Admin-only updates
router.post('/', protect, admin, updateSetting);

export default router;
