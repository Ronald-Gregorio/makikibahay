import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    ownerId: mongoose.Types.ObjectId;
    name: string;
    address: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    totalRooms: number;
    availableRooms: number;
    priceMin: number;
    priceMax: number;
    rules: string[];
    amenities: string[];
    coverPhoto?: string;
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ListingSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    totalRooms: { type: Number, required: true, min: 1 },
    availableRooms: { type: Number, required: true, min: 0 },
    priceMin: { type: Number, required: true, min: 0 },
    priceMax: { type: Number, required: true, min: 0 },
    rules: [{ type: String }],
    amenities: [{ type: String }],
    coverPhoto: { type: String },
    photos: [{ type: String }],
}, { timestamps: true });

ListingSchema.index({ location: '2dsphere' });
ListingSchema.index({ ownerId: 1 });
ListingSchema.index({ priceMin: 1, priceMax: 1 });

export default mongoose.model<IListing>('Listing', ListingSchema);
