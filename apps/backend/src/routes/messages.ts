import { Router } from 'express';
import { app, io } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { roomId, content, receiverId } = req.body;
    
    const messageData = {
      roomId,
      content,
      senderId: req.user!.id,
      receiverId,
      listingId: roomId.split('_')[1] // Extract listing ID from room ID
    };
    
    // Save to database
    const MessageModel = require('../models/Message.js').MessageModel;
    const message = new MessageModel(messageData);
    await message.save();
    
    // Emit via Socket.io
    const messageId = message._id;
    io.to(roomId).emit('messageReceived', {
      id: messageId,
      roomId,
      content,
      senderId: req.user!.id,
      receiverId,
      sentAt: message.createdAt
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const MessageModel = require('../models/Message.js').MessageModel;
    const { roomId } = req.params;
    const messages = await MessageModel.find({ roomId })
      .populate({ path: 'senderId', select: 'name avatar' })
      .sort({ sentAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:messageId/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const MessageModel = require('../models/Message.js').MessageModel;
    await MessageModel.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;