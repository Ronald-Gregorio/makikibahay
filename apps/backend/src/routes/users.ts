import express from 'express';
import { getUser, updateUser, addFavorite, removeFavorite } from '../controllers/userController.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
// router.get('/me', getMe); // Handled in auth routes
router.post('/favorites', protect, addFavorite);
router.delete('/favorites/:listingId', protect, removeFavorite);

export default router;
