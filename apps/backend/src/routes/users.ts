import express from 'express';
import { getUser, updateUser, addFavorite, removeFavorite, getMyReviews, getAllUsers, getFavorites } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me/reviews', protect, getMyReviews);
router.get('/me/favorites', protect, getFavorites);
router.post('/me/favorites', protect, addFavorite);
router.delete('/me/favorites/:listingId', protect, removeFavorite);

router.get('/', protect, getAllUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);

export default router;
