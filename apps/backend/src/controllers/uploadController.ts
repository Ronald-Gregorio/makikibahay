import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files in memory so we can upload them to Cloudinary directly
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
        }
    },
});

/**
 * Upload a single image to Cloudinary and return the secure URL.
 * Route: POST /api/upload
 * Body: multipart/form-data with field "image"
 */
export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file provided' });
        return;
    }

    try {
        // Upload buffer directly to Cloudinary using upload_stream
        const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'makikibahay/listings',
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(req.file!.buffer);
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error.message,
        });
    }
};
