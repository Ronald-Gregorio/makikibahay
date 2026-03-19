import { Request, Response } from 'express';
import Walkthrough from '../models/Walkthrough.js';

/**
 * GET /api/walkthroughs/:listingId
 * Public — returns the walkthrough config for a given listing.
 */
export const getWalkthrough = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;
    const walkthrough = await Walkthrough.findOne({ listingId });
    if (!walkthrough) {
      res.status(404).json({ message: 'No walkthrough found for this listing' });
      return;
    }
    res.json(walkthrough);
  } catch (error) {
    console.error('getWalkthrough error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/walkthroughs
 * Protected (owner) — create or replace the walkthrough for a listing.
 * Body: { listingId, title, scenes, defaultSceneId }
 */
export const saveWalkthrough = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?._id?.toString();
    if (!ownerId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { listingId, title, scenes, defaultSceneId } = req.body;

    if (!listingId) {
      res.status(400).json({ message: 'listingId is required' });
      return;
    }

    if (!Array.isArray(scenes) || scenes.length === 0) {
      res.status(400).json({ message: 'scenes must be a non-empty array' });
      return;
    }

    // Upsert: if a walkthrough already exists for this listing, replace it
    const walkthrough = await Walkthrough.findOneAndUpdate(
      { listingId },
      {
        $set: {
          ownerId,
          title: title || 'Virtual Tour',
          scenes,
          defaultSceneId: defaultSceneId || (scenes[0]?.id ?? ''),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(walkthrough);
  } catch (error) {
    console.error('saveWalkthrough error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/walkthroughs/:listingId
 * Protected (owner) — remove the walkthrough for a listing.
 */
export const deleteWalkthrough = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = (req as any).user?._id?.toString();
    const { listingId } = req.params;

    const walkthrough = await Walkthrough.findOne({ listingId });
    if (!walkthrough) {
      res.status(404).json({ message: 'Walkthrough not found' });
      return;
    }

    if (walkthrough.ownerId.toString() !== ownerId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    await Walkthrough.deleteOne({ listingId });
    res.json({ message: 'Walkthrough deleted' });
  } catch (error) {
    console.error('deleteWalkthrough error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
