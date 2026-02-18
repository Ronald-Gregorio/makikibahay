import { Request, Response } from 'express';
import Listing from '../models/Listing.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

export const getListings = async (req: Request, res: Response) => {
    try {
        const listings = await Listing.find().populate('ownerId', 'name avatar');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getListingById = async (req: Request, res: Response) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('ownerId', 'name avatar').lean();
        if (listing) {
            const rooms = await Room.find({ listingId: req.params.id });
            const reviews = await Review.find({ listingId: req.params.id }).populate('userId', 'name avatar');

            // Transform keys to match frontend expectation if needed, or update frontend.
            // Frontend expects: rooms (array), reviews (array).
            // Also frontend might expect mapped field names.
            // Let's return raw data and update frontend to adapt.

            res.json({ ...listing, rooms, reviews });
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createListing = async (req: Request, res: Response) => {
    try {
        const { name, address, priceMin, priceMax, description, totalRooms, availableRooms, amenities, rules, location, photos } = req.body;

        // Assuming user is attached to req by auth middleware
        // const ownerId = req.user._id; 
        // For now, we might receive ownerId in body if no middleware, or assume mock.
        // But listings MUST have ownerId.

        // If auth middleware is not yet active, extracting from body if present
        const ownerId = req.body.ownerId;

        if (!ownerId) {
            res.status(400).json({ message: 'Owner ID required' });
            return;
        }

        const listing = new Listing({
            ownerId,
            name,
            address,
            priceMin,
            priceMax,
            totalRooms,
            availableRooms,
            amenities,
            rules,
            location,
            photos
        });

        const createdListing = await listing.save();
        res.status(201).json(createdListing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
