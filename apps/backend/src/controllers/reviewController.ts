import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Listing from '../models/Listing.js';

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { listingId } = req.params;
        const reviews = await Review.find({ listingId }).populate('userId', 'name avatar').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        const { listingId } = req.params;
        const { rating, comment } = req.body;
        // const userId = req.user._id;
        const userId = req.body.userId; // Mocking auth for now if not passed via middleware

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const review = new Review({
            userId,
            listingId,
            rating,
            comment
        });

        await review.save();

        // Ideally update listing average rating if we stored it
        // For now just save review

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
