import { Request, Response } from 'express';
import SavedSearch from '../models/SavedSearch.js';

export const saveSearch = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const { name, filters } = req.body;

        const savedSearch = new SavedSearch({
            userId,
            name,
            filters
        });

        await savedSearch.save();
        res.status(201).json(savedSearch);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSavedSearches = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const searches = await SavedSearch.find({ userId }).sort({ createdAt: -1 });
        res.json(searches);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSavedSearch = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id;
        const { id } = req.params;

        await SavedSearch.findOneAndDelete({ _id: id, userId });
        res.json({ message: 'Saved search deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
