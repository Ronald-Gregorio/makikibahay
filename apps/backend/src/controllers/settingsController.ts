import { Request, Response } from 'express';
import Setting from '../models/Setting.js';

/**
 * GET /api/settings
 */
export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await Setting.find();
        const settingsMap = settings.reduce((acc: any, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

/**
 * POST /api/settings
 */
export const updateSetting = async (req: Request, res: Response) => {
    const { key, value, description } = req.body;
    try {
        const setting = await Setting.findOneAndUpdate(
            { key },
            { value, description },
            { upsert: true, new: true }
        );
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: 'Error updating setting' });
    }
};

/**
 * Initialize default settings if they don't exist
 */
export const initSettings = async () => {
    const defaults = [
        {
            key: 'propertyTypes',
            value: ['Apartment', 'Condo', 'Studio Type', 'Bed Spacer', 'Boarding House', 'Up and Down'],
            description: 'Available property types for listings'
        },
        {
            key: 'amenities',
            value: ['Air Conditioning', 'WiFi', 'Washer', 'Dryer', 'Utilities Included', 'Parking', 'Garage', 'Laundry Facilities', 'Kitchen', 'Appliances Included'],
            description: 'Common amenities for properties'
        },
        {
            key: 'houseRules',
            value: ['No curfew', 'Visitors allowed until 10 PM', 'No smoking', 'No pets', 'Parking available', 'Quiet hours after 10 PM', 'Students only', 'Cooking not allowed'],
            description: 'Standard house rules for owners'
        }
    ];

    for (const d of defaults) {
        await Setting.findOneAndUpdate({ key: d.key }, d, { upsert: true });
    }
};
