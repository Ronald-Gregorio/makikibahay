import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    listingId: mongoose.Types.ObjectId;
    sizeSqm: number;
    price: number;
    inclusions: string[];
    isAvailable: boolean;
    model3dUrl?: string;
    waypoints?: any[]; // For 3D tour
}

const RoomSchema: Schema = new Schema({
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    sizeSqm: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    inclusions: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    model3dUrl: { type: String },
    waypoints: [{ type: Schema.Types.Mixed }]
});

RoomSchema.index({ listingId: 1 });

export default mongoose.model<IRoom>('Room', RoomSchema);
