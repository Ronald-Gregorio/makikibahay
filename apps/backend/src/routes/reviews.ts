import express from 'express';
import { getReviews, createReview, getMyReviews } from '../controllers/reviewController.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.get('/me', protect, getMyReviews);
router.get('/:listingId', getReviews);
router.post('/:listingId', protect, createReview);

export default router;
