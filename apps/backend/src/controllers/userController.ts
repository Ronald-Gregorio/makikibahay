import { Request, Response } from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update allowed fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.avatar) user.avatar = req.body.avatar;
        if (req.body.preferences) {
            user.preferences = { ...user.preferences, ...req.body.preferences };
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const addFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const { listingId } = req.body;

        await User.findByIdAndUpdate(userId, {
            $addToSet: { favorites: listingId }
        });

        res.json({ message: 'Added to favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const { listingId } = req.params;

        await User.findByIdAndUpdate(userId, {
            $pull: { favorites: listingId }
        });

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const user = await User.findById(userId).populate('favorites');
        res.json(user?.favorites || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyReviews = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const reviews = await Review.find({ userId })
            .populate('listingId', 'name address')
            .sort({ createdAt: -1 });

        // Normalize field names for frontend
        const normalized = reviews.map((rev: any) => ({
            review_id: rev._id.toString(),
            _id: rev._id.toString(),
            user_id: rev.userId.toString(),
            listing_id: rev.listingId?._id?.toString() || rev.listingId?.toString() || '',
            listing_name: rev.listingId?.name || 'Unknown Listing',
            rating: rev.rating,
            comment: rev.comment,
            created_at: rev.createdAt?.toISOString() || '',
        }));

        res.json(normalized);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
