import { Router } from 'express';
import { ListingModel } from '../models/Listing.js';
// import { validateCreateListing, validateUpdateListing, validateSearchQuery } from '@makikibahay/utils';

// Temporary placeholder functions
const validateSearchQuery = (query: any) => query;
const validateCreateListing = (data: any) => data;
const validateUpdateListing = (data: any) => data;
const requireRole = (role: string) => (req: any, res: any, next: any) => next();
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = validateSearchQuery(req.query);
    
    const searchQuery: any = {};
    
    if (query.lat && query.lng) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [query.lng, query.lat]
          },
          $maxDistance: query.maxDistance || 10000 // Default 10km
        }
      };
    }
    
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      searchQuery.$and = [];
      if (query.priceMin !== undefined) {
        searchQuery.$and.push({ priceMin: { $gte: query.priceMin } });
      }
      if (query.priceMax !== undefined) {
        searchQuery.$and.push({ priceMax: { $lte: query.priceMax } });
      }
    }
    
    if (query.type) {
      searchQuery['amenities'] = query.type; // This would need adjustment for proper accommodation type filtering
    }
    
    if (query.amenities && query.amenities.length > 0) {
      searchQuery.amenities = { $in: query.amenities };
    }
    
    const listings = await ListingModel.find(searchQuery)
      .populate('ownerId', 'name email avatar')
      .limit(query.limit)
      .skip(query.offset)
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    console.error('Search listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, proximityMinutes, limit } = req.query;
    const walkingSpeedMetersPerMinute = 80; // Average walking speed ~4.8 km/h = 80 m/min
    const maxDistance = (Number(proximityMinutes) || 10) * walkingSpeedMetersPerMinute;
    
    const listings = await ListingModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: maxDistance
        }
      }
    })
      .populate('ownerId', 'name email avatar')
      .limit(Number(limit) || 10)
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    console.error('Nearby listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await ListingModel.findById(req.params.id)
      .populate('ownerId', 'name email avatar')
      .populate({
        path: 'rooms',
        match: { isAvailable: true }
      });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, requireRole(['owner', 'admin']), async (req: AuthRequest, res) => {
  try {
    const listingData = validateCreateListing(req.body);
    listingData.ownerId = req.user!.id;
    
    const listing = new ListingModel(listingData);
    await listing.save();
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, requireRole(['owner', 'admin']), async (req: AuthRequest, res) => {
  try {
    const listing = await ListingModel.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Check if user owns this listing or is admin
    if (listing.ownerId.toString() !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    const updateData = validateUpdateListing(req.body);
    const updatedListing = await ListingModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, requireRole(['owner', 'admin']), async (req: AuthRequest, res) => {
  try {
    const listing = await ListingModel.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Check if user owns this listing or is admin
    if (listing.ownerId.toString() !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    await ListingModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;