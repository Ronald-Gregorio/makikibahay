import express from 'express';
import { getListings, getListingById, createListing, getFeaturedListings } from '../controllers/listingController.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.get('/', getListings);
router.get('/featured', getFeaturedListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);

export default router;
