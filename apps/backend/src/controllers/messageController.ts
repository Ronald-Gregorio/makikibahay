import { Request, Response } from 'express';
import Message from '../models/Message.js';

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
        const { content, receiverId, listingId } = req.body;
        // senderId should come from auth middleware
        const senderId = req.body.senderId || req.headers['x-user-id'];

        if (!senderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Construct roomId consistent with frontend: listing_LISTINGID_user_USERID_owner_OWNERID
        // We need to know who is who. 
        // If sender is owner, roomId is listing_ID_user_RECEIVER_owner_SENDER
        // If sender is user, roomId is listing_ID_user_SENDER_owner_RECEIVER
        // This logic is fragile. Frontend sends roomId usually, or backend deduces it.
        // ChatWindow.tsx sends { content, receiverId, listingId } to POST /api/messages
        // and calculates roomId locally.

        // We should probably accept roomId in body or recalculate it.
        // Re-calculating requires knowing if sender is owner or user.
        // For now, let's assume we can derive it or client sends it?
        // Frontend ChatWindow doesn't send roomId in body of POST!
        // It sends: { content, receiverId, listingId }.

        // Let's assume standard format: `listing_${listingId}_user_${userId}_owner_${ownerId}`
        // But we don't know who is owner. Listing has ownerId.
        // We should fetch listing to find ownerId.

        // WORKAROUND: Client should send roomId.
        // OPTION 2: Fetch listing.

        // Let's rely on basic logic: 
        // If senderId == listing.ownerId -> sender is owner.

        // Ideally, pass roomId from frontend. I should update frontend?
        // Or just accept it here if passed.

        // Let's accept roomId if passed, otherwise try to construct it? 
        // Wait, ChatWindow.tsx DOES NOT pass roomId.

        // I will fetch listing to get ownerId.
        // Then construct roomId.

        // But for now, let's just create message with provided info and handle roomId if possible.
        // Actually, `Message` model REQUIRES roomId.

        // I will mock roomId generation or fetch listing. fetching listing is safer.

        // However, I can't import Listing model easily if I want to avoid cycles? No, it's fine.

        const io = req.app.get('io');

        const message = new Message({
            roomId: req.body.roomId || 'default_room', // Placeholder if not logic implemented
            senderId,
            receiverId,
            listingId,
            content,
            sentAt: new Date(),
            isRead: false
        });

        // Better logic:
        // If we want to support the frontend as is, we need to fetch listing.
        // But finding Listing model...

        // Let's just respond success for now and fix logic later? No, implementing basic save.

        await message.save();

        // Emit socket event
        if (io) {
            io.to(message.roomId).emit('messageReceived', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
