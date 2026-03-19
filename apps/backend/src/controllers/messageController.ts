import { Request, Response } from 'express';
import Message from '../models/Message.js';
import Listing from '../models/Listing.js';

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ roomId }).sort({ sentAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createMessage = async (req: Request, res: Response) => {
    try {
        const { content, receiverId, listingId, roomId: clientRoomId } = req.body;
        const senderId = (req as any).user?._id?.toString() || req.body.senderId || req.headers['x-user-id'];

        if (!senderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!content || !receiverId) {
            res.status(400).json({ message: 'content and receiverId are required' });
            return;
        }

        // Compute roomId: either use what the client sent, or construct it
        let roomId = clientRoomId;

        if (!roomId) {
            if (listingId) {
                // Listing-scoped conversation
                const listing = await Listing.findById(listingId);
                if (!listing) {
                    res.status(404).json({ message: 'Listing not found' });
                    return;
                }
                const ownerId = listing.ownerId.toString();
                const userId = senderId === ownerId ? receiverId : senderId;
                roomId = `listing_${listingId}_user_${userId}_owner_${ownerId}`;
            } else {
                // Direct message (no listing) — build a stable canonical roomId
                const participants = [senderId, receiverId].sort();
                roomId = `dm_${participants[0]}_${participants[1]}`;
            }
        }

        const io = req.app.get('io');

        const message = new Message({
            roomId,
            senderId,
            receiverId,
            ...(listingId ? { listingId } : {}),
            content,
            sentAt: new Date(),
            isRead: false
        });

        await message.save();

        if (io) {
            io.to(roomId).emit('messageReceived', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new Message.db.base.Types.ObjectId(userId) },
                        { receiverId: new Message.db.base.Types.ObjectId(userId) }
                    ]
                }
            },
            { $sort: { sentAt: -1 } },
            {
                $group: {
                    _id: '$roomId',
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            { $replaceRoot: { newRoot: '$lastMessage' } },
            { $sort: { sentAt: -1 } }
        ]);

        // Manually populate since aggregate doesn't support it easily for multiple fields
        const populatedMessages = await Message.populate(messages, [
            { path: 'senderId', select: 'name avatar email' },
            { path: 'receiverId', select: 'name avatar email' },
            { path: 'listingId', select: 'name photos' }
        ]);

        res.json(populatedMessages);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isRead, isStarred, isArchived, isTrashed } = req.body;
        const userId = (req as any).user?._id;

        const message = await Message.findById(id);

        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        // Verify user is sender or receiver
        if (message.senderId.toString() !== userId.toString() && message.receiverId.toString() !== userId.toString()) {
            res.status(403).json({ message: 'Not authorized to update this message' });
            return;
        }

        if (isRead !== undefined) message.isRead = isRead;
        if (isStarred !== undefined) message.isStarred = isStarred;
        if (isArchived !== undefined) message.isArchived = isArchived;
        if (isTrashed !== undefined) message.isTrashed = isTrashed;

        await message.save();
        res.json(message);
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
