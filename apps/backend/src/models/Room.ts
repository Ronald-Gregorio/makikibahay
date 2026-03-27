import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    listingId: mongoose.Types.ObjectId;
    type: string;
    sizeSqm: number;
    price: number;
    inclusions: string[];
    isAvailable: boolean;
    dimensions?: string; // e.g. "4x5m"
    maxOccupancy?: number;
    isPrivateToilet?: boolean;
    model3dUrl?: string;
    waypoints?: any[]; // For 3D tour
}

const RoomSchema: Schema = new Schema({
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    type: { type: String, required: true },
    sizeSqm: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    inclusions: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    dimensions: { type: String },
    maxOccupancy: { type: Number },
    isPrivateToilet: { type: Boolean, default: false },
    model3dUrl: { type: String },
    waypoints: [{ type: Schema.Types.Mixed }]
});

RoomSchema.index({ listingId: 1 });

export default mongoose.model<IRoom>('Room', RoomSchema);
