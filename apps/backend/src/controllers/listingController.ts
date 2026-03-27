import { Request, Response } from 'express';
import Listing from '../models/Listing.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';

export const getListings = async (req: Request, res: Response) => {
    try {
        const { priceMin, priceMax, monthlyRentMin, monthlyRentMax, amenities, limit, sort, has3DView, propertyType, type, bedrooms, bathrooms, petPolicy, specialtyProperty } = req.query;
        const query: any = {};

        // Pricing (Support both old and new field names)
        const rentMin = monthlyRentMin || priceMin;
        const rentMax = monthlyRentMax || priceMax;
        if (rentMin) {
            query.monthlyRent = { ...query.monthlyRent, $gte: Number(rentMin) };
        }
        if (rentMax) {
            query.monthlyRent = { ...query.monthlyRent, $lte: Number(rentMax) };
        }

        // Property Type
        const pType = propertyType || type;
        if (pType) {
            query.propertyType = pType;
        }

        // Rooms
        if (bedrooms && bedrooms !== 'Any') query.bedrooms = bedrooms;
        if (bathrooms && bathrooms !== 'Any') query.bathrooms = bathrooms;

        // Policies
        if (petPolicy) query.petPolicy = petPolicy;
        if (specialtyProperty) query.specialtyProperty = specialtyProperty;

        // Amenities
        if (amenities) {
            const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
            const amenityQueries = amenitiesArray.map(a => {
                const mapping: Record<string, string> = {
                    'AC': 'airConditioning',
                    'Air Conditioning': 'airConditioning',
                    'WiFi': 'wifi',
                    'wifi': 'wifi',
                    'Washer': 'washer',
                    'Dryer': 'dryer',
                    'Utilities Included': 'utilitiesIncluded',
                    'Dishwasher': 'dishwasher',
                    'Kitchen': 'kitchen'
                };
                const fieldName = mapping[a as string];
                return fieldName ? { [fieldName]: true } : { amenities: a };
            });
            if (amenityQueries.length > 0) {
                query.$or = amenityQueries;
            }
        }

        if (has3DView === 'true' || req.query.hasEnhancedViewing === 'true') {
            query.$or = [
                ...(query.$or || []),
                { virtualTour360: { $exists: true, $ne: '' } },
                { hasEnhancedViewing: true }
            ];
        }

        const maxResults = limit ? Math.min(Number(limit), 100) : 50;
        let sortOption: any = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { monthlyRent: 1 };
        if (sort === 'price_desc') sortOption = { monthlyRent: -1 };

        const listings = await Listing.find(query)
            .populate('ownerId', 'name avatar email')
            .limit(maxResults)
            .sort(sortOption);
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFeaturedListings = async (req: Request, res: Response) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 }).limit(3).populate('ownerId', 'name avatar email');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching featured listings' });
    }
};

export const getListingById = async (req: Request, res: Response) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('ownerId', 'name avatar email').lean();
        if (listing) {
            const rooms = await Room.find({ listingId: req.params.id });
            const reviews = await Review.find({ listingId: req.params.id }).populate('userId', 'name avatar');
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
        const ownerId = (req as any).user?._id || req.body.ownerId;
        if (!ownerId) {
            res.status(400).json({ message: 'Owner ID required' });
            return;
        }

        const data = {
            ownerId,
            listingName: req.body.listingName || req.body.name,
            propertyType: req.body.propertyType || req.body.type,
            description: req.body.description,
            photos: req.body.photos,
            video: req.body.video,
            virtualTour360: req.body.virtualTour360,
            hasEnhancedViewing: req.body.hasEnhancedViewing || !!req.body.virtualTour360,
            floorPlans: req.body.floorPlans,
            fullAddress: req.body.fullAddress || req.body.address,
            mapLoc: req.body.mapLoc || req.body.location,
            neighborhoodNear: req.body.neighborhoodNear,
            transportationOptions: req.body.transportationOptions,
            roomType: req.body.roomType || 'Standard',
            availableRooms: req.body.availableRooms || req.body.available_rooms || 0,
            bedrooms: req.body.bedrooms || 'Studio',
            bathrooms: req.body.bathrooms || '1',
            squareFeet: req.body.squareFeet || 0,
            monthlyRent: req.body.monthlyRent || req.body.priceMin || 0,
            moveInDate: req.body.moveInDate || new Date(),
            securityDeposit: req.body.securityDeposit || 0,
            advancePayment: req.body.advancePayment || 0,
            applicationReviewFee: req.body.applicationReviewFee || 0,
            specialtyProperty: req.body.specialtyProperty || 'None',
            petPolicy: req.body.petPolicy || 'No Pets',
            hasCurfew: req.body.hasCurfew,
            visitorsAllowed: req.body.visitorsAllowed,
            smokingAllowed: req.body.smokingAllowed,
            cookingAllowed: req.body.cookingAllowed,
            quietHours: req.body.quietHours,
            airConditioning: req.body.airConditioning,
            wifi: req.body.wifi,
            washer: req.body.washer,
            dryer: req.body.dryer,
            utilitiesIncluded: req.body.utilitiesIncluded,
            dishwasher: req.body.dishwasher,
            parkingType: req.body.parkingType,
            laundryFacilities: req.body.laundryFacilities,
            kitchen: req.body.kitchen,
            appliancesIncluded: req.body.appliancesIncluded,
            status: req.body.status || 'Active'
        };

        const listing = new Listing(data);
        const createdListing = await listing.save();

        if (req.body.rooms && Array.isArray(req.body.rooms) && req.body.rooms.length > 0) {
            const roomDocs = req.body.rooms.map((room: any) => ({
                listingId: createdListing._id,
                type: room.type || 'Standard',
                sizeSqm: room.sizeSqm || room.size_sqm || 15,
                price: room.price,
                inclusions: room.inclusions,
                isAvailable: room.isAvailable ?? room.is_available ?? true,
                dimensions: room.dimensions,
                maxOccupancy: room.maxOccupancy || room.max_occupancy,
                isPrivateToilet: room.isPrivateToilet ?? room.is_private_toilet,
                model3dUrl: room.model3dUrl || room.model_3d_url
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

        const listings = await Listing.find({ ownerId }).populate('ownerId', 'name avatar').sort({ createdAt: -1 });
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

export const updateListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const ownerId = (req as any).user?._id?.toString();
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        if (listing.ownerId.toString() !== ownerId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        const fieldsToUpdate = [
            'listingName', 'propertyType', 'description', 'photos', 'video', 'virtualTour360', 'floorPlans',
            'fullAddress', 'mapLoc', 'neighborhoodNear', 'transportationOptions',
            'roomType', 'availableRooms', 'bedrooms', 'bathrooms', 'squareFeet', 'monthlyRent', 'moveInDate',
            'securityDeposit', 'advancePayment', 'applicationReviewFee', 'specialtyProperty',
            'petPolicy', 'hasCurfew', 'visitorsAllowed', 'smokingAllowed', 'cookingAllowed', 'quietHours',
            'airConditioning', 'wifi', 'washer', 'dryer', 'utilitiesIncluded', 'dishwasher', 'parkingType',
            'laundryFacilities', 'kitchen', 'appliancesIncluded', 'status'
        ];

        const body = req.body as Record<string, any>;
        fieldsToUpdate.forEach(field => {
            if (body[field] !== undefined) {
                (listing as any)[field] = body[field];
            }
        });

        // Compatibility aliases
        if (body.name !== undefined) listing.listingName = body.name;
        if (body.address !== undefined) listing.fullAddress = body.address;
        if (body.type !== undefined) listing.propertyType = body.type;
        if (body.priceMin !== undefined) listing.monthlyRent = body.priceMin;
        if (body.location !== undefined) (listing as any).mapLoc = body.location;

        await listing.save();

        if (body.rooms && Array.isArray(body.rooms)) {
            await Room.deleteMany({ listingId: listing._id });
            if (body.rooms.length > 0) {
                const roomDocs = body.rooms.map((room: any) => ({
                    listingId: listing._id,
                    type: room.type || 'Standard',
                    sizeSqm: room.sizeSqm || room.size_sqm || 15,
                    price: room.price,
                    inclusions: room.inclusions,
                    isAvailable: room.isAvailable ?? room.is_available ?? true,
                    dimensions: room.dimensions,
                    maxOccupancy: room.maxOccupancy || room.max_occupancy,
                    isPrivateToilet: room.isPrivateToilet ?? room.is_private_toilet,
                    model3dUrl: room.model3dUrl || room.model_3d_url,
                }));
                await Room.insertMany(roomDocs);
            }
        }

        const updatedRooms = await Room.find({ listingId: listing._id });
        res.json({ ...listing.toObject(), rooms: updatedRooms });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteListing = async (req: Request, res: Response): Promise<void> => {
    try {
        const ownerId = (req as any).user?._id?.toString();
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }
        if (listing.ownerId.toString() !== ownerId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        await Room.deleteMany({ listingId: listing._id });
        await Listing.deleteOne({ _id: listing._id });
        res.json({ message: 'Listing deleted' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
