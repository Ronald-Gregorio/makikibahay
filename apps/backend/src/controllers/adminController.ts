import { Request, Response } from 'express';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';

/**
 * GET /api/admin/metrics
 * Returns platform-wide metrics for the admin dashboard
 */
export const getAdminMetrics = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = await Listing.countDocuments();
        const totalReviews = await Review.countDocuments();

        // Count users created in the last 6 months, grouped by month
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowthAgg = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const userGrowthData = userGrowthAgg.map((item: any) => ({
            month: item._id,
            users: item.users
        }));

        // Count listings by status
        const listingStatusAgg = await Listing.aggregate([
            {
                $group: {
                    _id: '$status',
                    value: { $sum: 1 }
                }
            }
        ]);

        const listingStatusData = listingStatusAgg.map((item: any) => ({
            name: item._id || 'active',
            value: item.value,
            fill: item._id === 'active' ? 'hsl(var(--chart-1))' :
                  item._id === 'pending' ? 'hsl(var(--chart-2))' :
                  'hsl(var(--chart-3))'
        }));

        // If there's no status data, provide defaults
        if (listingStatusData.length === 0) {
            listingStatusData.push(
                { name: 'active', value: totalListings, fill: 'hsl(var(--chart-1))' }
            );
        }

        res.json({
            totalUsers,
            totalListings,
            totalRevenue: '₱0', // Placeholder — no revenue model yet
            activeUsers: Math.min(totalUsers, 3), // Mock active users
            userGrowthData,
            listingStatusData
        });
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/admin/users
 * Returns all users for admin management
 */
export const getAdminUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        const normalized = await Promise.all(users.map(async (u: any) => {
            const listingsCount = await Listing.countDocuments({ ownerId: u._id });
            // For renters, count active tenants or approved applications
            // For now let's use Tenant count if they are a tenant
            const Tenant = (await import('../models/Tenant.js')).default;
            const rentedCount = await Tenant.countDocuments({ userId: u._id, status: 'active' });

            return {
                id: u._id.toString(),
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                username: u.username,
                role: u.role,
                avatar: u.avatar,
                createdAt: u.createdAt?.toISOString() || '',
                joined: u.createdAt?.toISOString() || '',
                status: u.status || 'Active',
                listingsCount,
                rentedCount
            };
        }));

        res.json(normalized);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/admin/reviews
 * Returns all reviews for admin moderation
 */
export const getAdminReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email avatar')
            .populate('listingId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        const normalized = reviews.map((r: any) => ({
            review_id: r._id.toString(),
            _id: r._id.toString(),
            user_id: r.userId?._id?.toString() || '',
            listing_id: r.listingId?._id?.toString() || r.listingId?.toString() || '',
            listingId: r.listingId?._id?.toString() || r.listingId?.toString() || '',
            listingName: r.listingId?.name || 'Unknown Listing',
            rating: r.rating,
            comment: r.comment,
            created_at: r.createdAt?.toISOString() || '',
            user: {
                name: r.userId?.name || 'Unknown User',
                avatar: r.userId?.avatar || '',
                email: r.userId?.email || '',
            }
        }));

        res.json(normalized);
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/admin/logs
 * Returns system activity logs (derived from recent DB activity)
 */
export const getAdminLogs = async (req: Request, res: Response) => {
    try {
        // Build activity logs from recent database activity
        const logs: any[] = [];

        // Recent user registrations
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        recentUsers.forEach((u: any) => {
            logs.push({
                id: `user_${u._id}`,
                type: 'user_registration',
                message: `New ${u.role} registered: ${u.name} (${u.email})`,
                timestamp: u.createdAt?.toISOString() || '',
                level: 'info',
                source: 'auth',
            });
        });

        // Recent listings
        const recentListings = await Listing.find()
            .select('name address createdAt updatedAt')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        recentListings.forEach((l: any) => {
            logs.push({
                id: `listing_${l._id}`,
                type: 'listing_created',
                message: `Listing created: "${l.name}" at ${l.address}`,
                timestamp: l.createdAt?.toISOString() || '',
                level: 'info',
                source: 'listings',
            });
        });

        // Recent reviews
        const recentReviews = await Review.find()
            .populate('userId', 'name')
            .populate('listingId', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        recentReviews.forEach((r: any) => {
            logs.push({
                id: `review_${r._id}`,
                type: 'review_submitted',
                message: `Review submitted by ${r.userId?.name || 'Unknown'} for "${r.listingId?.name || 'Unknown'}" (${r.rating}★)`,
                timestamp: r.createdAt?.toISOString() || '',
                level: 'info',
                source: 'reviews',
            });
        });

        // Recent messages
        const recentMessages = await Message.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        recentMessages.forEach((m: any) => {
            logs.push({
                id: `msg_${m._id}`,
                type: 'message_sent',
                message: `Message sent in room ${m.roomId || 'unknown'}`,
                timestamp: m.createdAt?.toISOString() || m.sentAt?.toISOString() || '',
                level: 'info',
                source: 'messaging',
            });
        });

        // Sort all logs by timestamp descending
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json(logs);
    } catch (error) {
        console.error('Error fetching admin logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/admin/tickets
 * Returns support tickets (mock — no Ticket model exists yet)
 */
export const getAdminTickets = async (req: Request, res: Response) => {
    try {
        // No Ticket model exists yet — return empty array
        // When a Ticket model is created, this should query it
        res.json([]);
    } catch (error) {
        console.error('Error fetching admin tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
/**
 * GET /api/admin/listings
 * Returns all listings for admin management (including unpublished)
 */
export const getAdminListings = async (req: Request, res: Response) => {
    try {
        const listings = await Listing.find()
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const normalized = await Promise.all(listings.map(async (l: any) => {
            const rooms = await Room.find({ listingId: l._id });
            return {
                id: l._id.toString(),
                _id: l._id.toString(),
                name: l.name,
                address: l.address,
                owner_name: l.ownerId?.name || 'Unknown',
                status: l.status || 'Active',
                photos: l.photos || [],
                rooms: rooms.map(r => ({
                    ...r.toObject(),
                    room_id: r._id.toString(),
                    _id: r._id.toString()
                })),
                rules: l.rules || [],
            };
        }));

        res.json(normalized);
    } catch (error) {
        console.error('Error fetching admin listings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * PATCH /api/admin/users/bulk-status
 */
export const bulkUpdateUsersStatus = async (req: Request, res: Response) => {
    const { userIds, status } = req.body;
    try {
        await User.updateMany({ _id: { $in: userIds } }, { status });
        res.json({ message: `Successfully updated ${userIds.length} users to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error performing bulk update' });
    }
};

/**
 * DELETE /api/admin/users/bulk
 */
export const bulkDeleteUsers = async (req: Request, res: Response) => {
    const { userIds } = req.body;
    try {
        await User.deleteMany({ _id: { $in: userIds } });
        res.json({ message: `Successfully deleted ${userIds.length} users` });
    } catch (error) {
        res.status(500).json({ message: 'Error performing bulk delete' });
    }
};

/**
 * POST /api/admin/users/bulk-notify
 */
export const bulkNotifyUsers = async (req: Request, res: Response) => {
    const { userIds, message } = req.body;
    const adminId = (req as any).user?._id;

    if (!adminId || !message || !userIds || !Array.isArray(userIds)) {
        res.status(400).json({ message: 'Invalid payload' });
        return;
    }

    try {
        const messages = userIds.map((userId) => {
            const participants = [adminId.toString(), userId.toString()].sort();
            const roomId = `dm_${participants[0]}_${participants[1]}`;

            return {
                roomId,
                senderId: adminId,
                receiverId: userId,
                content: message,
                sentAt: new Date(),
                isRead: false
            };
        });

        await Message.insertMany(messages);

        const io = req.app.get('io');
        if (io) {
            messages.forEach((msg) => {
                io.to(`user_${msg.receiverId}`).emit('newNotification', {
                    type: 'message',
                    senderId: adminId,
                    content: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '')
                });
                io.to(msg.roomId).emit('messageReceived', msg);
            });
        }

        res.json({ message: `Successfully sent notification to ${userIds.length} users` });
    } catch (error) {
        console.error('Error in bulkNotifyUsers:', error);
        res.status(500).json({ message: 'Error sending bulk notifications' });
    }
};

/**
 * PATCH /api/admin/listings/bulk-status
 */
export const bulkUpdateListingsStatus = async (req: Request, res: Response) => {
    const { listingIds, status } = req.body;
    try {
        await Listing.updateMany({ _id: { $in: listingIds } }, { status });
        res.json({ message: `Successfully updated ${listingIds.length} listings to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error performing bulk update' });
    }
};

/**
 * DELETE /api/admin/listings/bulk
 */
export const bulkDeleteListings = async (req: Request, res: Response) => {
    const { listingIds } = req.body;
    try {
        await Listing.deleteMany({ _id: { $in: listingIds } });
        res.json({ message: `Successfully deleted ${listingIds.length} listings` });
    } catch (error) {
        res.status(500).json({ message: 'Error performing bulk delete' });
    }
};
/**
 * GET /api/admin/listings/:id
 */
export const getAdminListingById = async (req: Request, res: Response) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('ownerId', 'name email avatar')
            .lean();
            
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        
        const rooms = await Room.find({ listingId: req.params.id });
        res.json({ ...listing, rooms });
    } catch (error) {
        console.error('Error fetching admin listing by id:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * PUT /api/admin/listings/:id
 */
export const updateAdminListing = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rooms, ...listingData } = req.body;

        const listing = await Listing.findByIdAndUpdate(id, listingData, { new: true });
        
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }

        if (rooms && Array.isArray(rooms)) {
            // Get current room IDs from DB
            const existingRooms = await Room.find({ listingId: id });
            const existingRoomIds = existingRooms.map(r => r._id.toString());
            
            const incomingRoomIds = rooms.map(r => r._id || r.id).filter(Boolean);

            // 1. Delete rooms that are not in the incoming list
            await Room.deleteMany({ 
                listingId: id, 
                _id: { $nin: incomingRoomIds } 
            });

            // 2. Update existing rooms or create new ones
            for (const roomData of rooms) {
                const roomId = roomData._id || roomData.id;
                
                if (roomId && existingRoomIds.includes(roomId)) {
                    // Update
                    await Room.findByIdAndUpdate(roomId, {
                        type: roomData.type,
                        price: roomData.price,
                        inclusions: roomData.inclusions,
                        isAvailable: roomData.is_available ?? roomData.isAvailable ?? true
                    });
                } else {
                    // Create
                    await Room.create({
                        listingId: id,
                        type: roomData.type,
                        price: roomData.price,
                        inclusions: roomData.inclusions,
                        isAvailable: roomData.is_available ?? roomData.isAvailable ?? true
                    });
                }
            }
        }

        const updatedRooms = await Room.find({ listingId: id });
        res.json({ ...listing.toObject(), rooms: updatedRooms });
    } catch (error) {
        console.error('Error updating admin listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
