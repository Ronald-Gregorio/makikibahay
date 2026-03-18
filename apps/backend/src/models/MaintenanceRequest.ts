import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceRequest extends Document {
    listingId: mongoose.Types.ObjectId;
    roomId?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId; // Tenant who requested
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
}

const MaintenanceRequestSchema: Schema = new Schema({
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
    photos: [{ type: String }],
}, { timestamps: true });

MaintenanceRequestSchema.index({ listingId: 1 });
MaintenanceRequestSchema.index({ userId: 1 });
MaintenanceRequestSchema.index({ status: 1 });

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
