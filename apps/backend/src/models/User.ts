import mongoose, { Schema, Document } from 'mongoose';

type UserRole = 'user' | 'owner' | 'admin';
type AccommodationType = 'solo' | 'shared' | 'studio' | 'bed-space';
export interface IUser extends Document {
    email: string;
    username?: string;
    name: string;
    password?: string;
    role: UserRole;
    avatar?: string;
    preferences?: {
        isStudent: boolean;
        accommodationType: AccommodationType;
        priceMin: number;
        priceMax: number;
        amenities: string[];
        location?: {
            type: 'Point';
            coordinates: [number, number];
        };
        proximityMinutes: 5 | 10 | 15;
    };
    favorites: string[]; // Listing IDs
    verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
    status: 'Active' | 'Suspended';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
    avatar: { type: String },
    preferences: {
        isStudent: { type: Boolean },
        accommodationType: { type: String, enum: ['solo', 'shared', 'studio', 'bed-space'] },
        priceMin: { type: Number },
        priceMax: { type: Number },
        amenities: [{ type: String }],
        location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        proximityMinutes: { type: Number, enum: [5, 10, 15], default: 10 }
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
    verificationStatus: { 
        type: String, 
        enum: ['unverified', 'pending', 'verified', 'rejected'], 
        default: 'unverified' 
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended'],
        default: 'Active'
    }
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);
