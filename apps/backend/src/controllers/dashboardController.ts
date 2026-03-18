import { Request, Response } from 'express';
import Listing from '../models/Listing.js';
import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';
import Application from '../models/Application.js';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import Message from '../models/Message.js';

export const getOwnerMetrics = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user?._id || req.query.ownerId;

        if (!ownerId) {
             res.status(400).json({ message: 'Owner ID required' });
             return;
        }

        const listings = await Listing.find({ ownerId });
        const listingIds = listings.map(l => l._id);

        const totalRooms = await Room.countDocuments({ listingId: { $in: listingIds } });
        const availableRooms = await Room.countDocuments({ listingId: { $in: listingIds }, isAvailable: true });
        
        const activeTenants = await Tenant.countDocuments({ listingId: { $in: listingIds }, status: 'active' });
        const pendingApplications = await Application.countDocuments({ listingId: { $in: listingIds }, status: 'pending' });
        const openMaintenance = await MaintenanceRequest.countDocuments({ listingId: { $in: listingIds }, status: { $in: ['pending', 'in_progress'] } });
        
        // Count unique inquiries (messages from non-owners)
        const inquiryCount = await Message.countDocuments({ 
            listingId: { $in: listingIds },
            senderId: { $ne: ownerId }
        });

        res.json({
            listingsCount: listings.length,
            totalRooms,
            availableRooms,
            activeTenants,
            pendingApplications,
            openMaintenance,
            inquiryCount,
            occupancyRate: totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0
        });
    } catch (error) {
        console.error('Error fetching owner metrics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getOwnerTenants = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user?._id || req.query.ownerId;

        if (!ownerId) {
            res.status(400).json({ message: 'Owner ID required' });
            return;
        }

        const listings = await Listing.find({ ownerId });
        const listingIds = listings.map(l => l._id);

        const tenants = await Tenant.find({ listingId: { $in: listingIds } })
            .populate('userId', 'name email avatar')
            .populate('listingId', 'name address')
            .populate('roomId', 'type price')
            .sort({ createdAt: -1 });

        res.json(tenants);
    } catch (error) {
        console.error('Error fetching owner tenants:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getOwnerSummary = async (req: Request, res: Response) => {
    try {
        const ownerId = (req as any).user?._id || req.query.ownerId;

        if (!ownerId) {
            res.status(400).json({ message: 'Owner ID required' });
            return;
        }

        const listings = await Listing.find({ ownerId });
        const listingIds = listings.map(l => l._id);

        const recentApplications = await Application.find({ listingId: { $in: listingIds }, status: 'pending' })
            .populate('userId', 'name avatar')
            .populate('listingId', 'name')
            .limit(5)
            .sort({ createdAt: -1 });

        const recentMaintenance = await MaintenanceRequest.find({ listingId: { $in: listingIds }, status: { $in: ['pending', 'in_progress'] } })
            .populate('listingId', 'name')
            .limit(5)
            .sort({ createdAt: -1 });

        res.json({
            applications: recentApplications,
            maintenance: recentMaintenance
        });
    } catch (error) {
        console.error('Error fetching owner summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
