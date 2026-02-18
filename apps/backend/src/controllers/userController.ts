import { Request, Response } from 'express';
import User from '../models/User.js';

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
        const userId = req.body.userId; // Should come from middleware
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
        const userId = req.body.userId; // Should come from middleware
        const { listingId } = req.params;

        await User.findByIdAndUpdate(userId, {
            $pull: { favorites: listingId }
        });

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
