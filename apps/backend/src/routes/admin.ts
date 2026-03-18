import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getAdminMetrics,
    getAdminUsers,
    getAdminReviews,
    getAdminLogs,
    getAdminTickets,
    getAdminListings,
    bulkUpdateUsersStatus,
    bulkDeleteUsers,
    bulkUpdateListingsStatus,
    bulkDeleteListings,
    getAdminListingById,
    updateAdminListing
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.get('/metrics', protect, admin, getAdminMetrics);
router.get('/users', protect, admin, getAdminUsers);
router.patch('/users/bulk-status', protect, admin, bulkUpdateUsersStatus);
router.delete('/users/bulk', protect, admin, bulkDeleteUsers);
router.get('/listings', protect, admin, getAdminListings);
router.patch('/listings/bulk-status', protect, admin, bulkUpdateListingsStatus);
router.delete('/listings/bulk', protect, admin, bulkDeleteListings);
router.get('/listings/:id', protect, admin, getAdminListingById);
router.put('/listings/:id', protect, admin, updateAdminListing);
router.get('/reviews', protect, admin, getAdminReviews);
router.get('/logs', protect, admin, getAdminLogs);
router.get('/tickets', protect, admin, getAdminTickets);

export default router;
