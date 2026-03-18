import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getOwnerMetrics, getOwnerTenants, getOwnerSummary } from '../controllers/dashboardController.js';
import { getOwnerListings } from '../controllers/listingController.js';

const router = express.Router();

router.get('/owner/metrics', protect, getOwnerMetrics);
router.get('/owner/tenants', protect, getOwnerTenants);
router.get('/owner/summary', protect, getOwnerSummary);
router.get('/owner/listings', protect, getOwnerListings);

export default router;
