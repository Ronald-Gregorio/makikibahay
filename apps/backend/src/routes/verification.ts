import express from 'express';
import { 
    submitVerification, 
    getPendingVerifications, 
    updateVerificationStatus 
} from '../controllers/verificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../controllers/uploadController.js';

const router = express.Router();

/**
 * Submit verification documents
 * Fields: idCard (required), selfie (owner only), proof (owner only)
 */
router.post(
    '/submit', 
    protect, 
    upload.fields([
        { name: 'idCard', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
        { name: 'proof', maxCount: 1 }
    ]), 
    submitVerification
);

// Admin routes
router.get('/admin/list', protect, admin, getPendingVerifications);
router.patch('/admin/update/:id', protect, admin, updateVerificationStatus);

export default router;
