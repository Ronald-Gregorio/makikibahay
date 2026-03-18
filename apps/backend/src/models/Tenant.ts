import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    userId: mongoose.Types.ObjectId;
    listingId: mongoose.Types.ObjectId;
    roomId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate?: Date;
    monthlyRent: number;
    status: 'active' | 'past';
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    monthlyRent: { type: Number, required: true },
    status: { type: String, enum: ['active', 'past'], default: 'active' },
}, { timestamps: true });

TenantSchema.index({ userId: 1 });
TenantSchema.index({ listingId: 1 });
TenantSchema.index({ roomId: 1 });

export default mongoose.model<ITenant>('Tenant', TenantSchema);
