import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, AccommodationType } from '@makikibahay/types';

export interface IUser extends Document {
    email: string;
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
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
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
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Listing' }]
}, { timestamps: true });

UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
