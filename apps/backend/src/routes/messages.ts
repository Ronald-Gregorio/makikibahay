import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.get('/:roomId', protect, getMessages);
router.post('/', protect, createMessage);

export default router;
