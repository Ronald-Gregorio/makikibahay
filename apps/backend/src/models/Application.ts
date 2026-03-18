import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    userId: mongoose.Types.ObjectId;
    listingId: mongoose.Types.ObjectId;
    roomId?: mongoose.Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    message: { type: String },
}, { timestamps: true });

ApplicationSchema.index({ userId: 1 });
ApplicationSchema.index({ listingId: 1 });
ApplicationSchema.index({ status: 1 });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
