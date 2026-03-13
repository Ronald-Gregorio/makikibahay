import express from 'express';
import { upload, uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload — requires auth, accepts single image field "image"
router.post('/', protect, upload.single('image'), uploadImage);

export default router;
