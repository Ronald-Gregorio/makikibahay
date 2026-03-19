import express from 'express';
import { getWalkthrough, saveWalkthrough, deleteWalkthrough } from '../controllers/walkthroughController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: fetch walkthrough for a listing
router.get('/:listingId', getWalkthrough);

// Protected: create / replace walkthrough
router.post('/', protect, saveWalkthrough);

// Protected: delete walkthrough
router.delete('/:listingId', protect, deleteWalkthrough);

export default router;
