import express from 'express';
import { getMessages, createMessage, getConversations, updateMessageStatus } from '../controllers/messageController.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.get('/conversations', protect, getConversations);
router.get('/:roomId', protect, getMessages);
router.post('/', protect, createMessage);
router.patch('/:id/status', protect, updateMessageStatus);

export default router;
