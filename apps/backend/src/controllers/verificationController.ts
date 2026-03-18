import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Verification from '../models/Verification.js';
import User from '../models/User.js';

// Reuse cloudinary config from uploadController or re-config if needed
// For now, assuming it's already configured in index.ts or similar via dotenv
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, folder: string) => {
    return new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `makikibahay/verification/${folder}`,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

/**
 * Submit verification documents
 * Route: POST /api/verification/submit
 */
export const submitVerification = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const userId = (req as any).user._id;
    const role = (req as any).user.role;

    if (!files || !files['idCard']) {
        res.status(400).json({ message: 'ID Card is required' });
        return;
    }

    try {
        const idResult = await uploadToCloudinary(files['idCard'][0].buffer, 'ids');
        let selfieUrl = '';
        let proofUrl = '';

        if (role === 'owner') {
            if (!files['selfie'] || !files['proof']) {
                res.status(400).json({ message: 'Selfie and Proof of Ownership are required for owners' });
                return;
            }
            const selfieResult = await uploadToCloudinary(files['selfie'][0].buffer, 'selfies');
            const proofResult = await uploadToCloudinary(files['proof'][0].buffer, 'proofs');
            selfieUrl = selfieResult.secure_url;
            proofUrl = proofResult.secure_url;
        }

        const verification = await Verification.findOneAndUpdate(
            { userId },
            {
                role,
                idUrl: idResult.secure_url,
                selfieUrl,
                proofUrl,
                status: 'pending',
                rejectionReason: ''
            },
            { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, { verificationStatus: 'pending' });

        res.status(201).json({
            message: 'Verification submitted successfully',
            verification
        });
    } catch (error: any) {
        console.error('Verification submission error:', error);
        res.status(500).json({ message: 'Failed to submit verification', error: error.message });
    }
};

/**
 * Get pending verifications (Admin only)
 * Route: GET /api/verification/admin/list
 */
export const getPendingVerifications = async (req: Request, res: Response) => {
    try {
        const verifications = await Verification.find({ status: 'pending' })
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(verifications);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch verifications', error: error.message });
    }
};

/**
 * Update verification status (Admin only)
 * Route: PATCH /api/verification/admin/update/:id
 */
export const updateVerificationStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
    }

    try {
        const verification = await Verification.findByIdAndUpdate(
            id,
            { status, rejectionReason },
            { new: true }
        );

        if (!verification) {
            res.status(404).json({ message: 'Verification request not found' });
            return;
        }

        const userStatus = status === 'approved' ? 'verified' : 'rejected';
        await User.findByIdAndUpdate(verification.userId, { verificationStatus: userStatus });

        res.json({ message: `Verification ${status}`, verification });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update verification status', error: error.message });
    }
};
