import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
    userId: mongoose.Types.ObjectId;
    role: 'user' | 'owner';
    idUrl: string;
    selfieUrl?: string; // For owners
    proofUrl?: string;  // For owners
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const VerificationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'owner'], required: true },
    idUrl: { type: String, required: true },
    selfieUrl: { type: String },
    proofUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String }
}, { timestamps: true });

// Ensure a user can only have one active verification request at a time if needed, 
// or just keep history. For now, we'll allow history but could index by userId if we want to limit.
VerificationSchema.index({ userId: 1 });
VerificationSchema.index({ status: 1 });

export default mongoose.model<IVerification>('Verification', VerificationSchema);
