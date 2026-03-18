import { Request, Response } from 'express';
import Listing from '../models/Listing.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

export const getListings = async (req: Request, res: Response) => {
    try {
        const { priceMin, priceMax, amenities, limit } = req.query;
        let query: any = {};

        // Price range filter: find listings where priceMin >= user's min AND priceMax <= user's max
        if (priceMin) {
            query.priceMin = { ...query.priceMin, $gte: Number(priceMin) };
        }
        if (priceMax) {
            query.priceMax = { ...query.priceMax, $lte: Number(priceMax) };
        }

        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            query.amenities = { $all: amenitiesArray };
        }

        const maxResults = limit ? Math.min(Number(limit), 100) : 50;

        const listings = await Listing.find(query)
            .populate('ownerId', 'name avatar')
            .limit(maxResults)
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFeaturedListings = async (req: Request, res: Response) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 }).limit(3).populate('ownerId', 'name avatar');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching featured listings' });
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
        const { name, address, priceMin, priceMax, totalRooms, availableRooms, amenities, rules, location, photos, rooms, type } = req.body;

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
            photos,
            type
        });

        const createdListing = await listing.save();

        if (rooms && Array.isArray(rooms) && rooms.length > 0) {
            const roomDocs = rooms.map(room => ({
                listingId: createdListing._id,
                type: room.type || 'Standard',
                sizeSqm: room.size_sqm || 15,
                price: room.price,
                inclusions: room.inclusions,
                isAvailable: room.is_available,
                model3dUrl: room.model_3d_url
            }));
            await Room.insertMany(roomDocs);
        }

        res.status(201).json(createdListing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ message: 'Server error when creating listing' });
    }
};

export const getOwnerListings = async (req: Request, res: Response) => {
    try {
        const ownerId = req.query.ownerId || (req as any).user?._id;

        if (!ownerId) {
            res.status(400).json({ message: 'Owner ID required' });
            return;
        }

        const listings = await Listing.find({ ownerId })
            .populate('ownerId', 'name avatar')
            .sort({ createdAt: -1 });

        // For each listing, get the room count
        const listingsWithRooms = await Promise.all(listings.map(async (listing) => {
            const rooms = await Room.find({ listingId: listing._id });
            return {
                ...listing.toObject(),
                totalRooms: rooms.length,
                availableRooms: rooms.filter(r => r.isAvailable).length,
                rooms
            };
        }));

        res.json(listingsWithRooms);
    } catch (error) {
        console.error('Error fetching owner listings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
