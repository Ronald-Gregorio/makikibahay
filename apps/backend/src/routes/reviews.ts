import express from 'express';
import { getReviews, createReview } from '../controllers/reviewController.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.get('/:listingId', getReviews);
router.post('/:listingId', protect, createReview);

export default router;
