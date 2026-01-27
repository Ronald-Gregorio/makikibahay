import mongoose, { Schema, Document } from 'mongoose';
import type { User, UserRole, UserPreferences } from '@makikibahay/types';

export interface IUserDocument extends Omit<User, '_id'>, Document {}

const LocationSchema = new Schema({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true }, // [lng, lat]
}, { _id: false });

const UserPreferencesSchema = new Schema({
  isStudent: { type: Boolean, required: true },
  accommodationType: { type: String, enum: ['solo', 'shared', 'studio', 'bed-space'], required: true },
  priceMin: { type: Number, required: true, min: 0 },
  priceMax: { type: Number, required: true, min: 0 },
  amenities: [{ type: String }],
  location: { type: LocationSchema, required: true },
  proximityMinutes: { type: Number, enum: [5, 10, 15], default: 10 },
}, { _id: false });

const UserSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  name: { type: String, required: true, trim: true, minlength: 1 },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  avatar: { type: String, validate: { validator: (v: string) => !v || /^https?:\/\/.+/.test(v), message: 'Invalid URL format' } },
  preferences: { type: UserPreferencesSchema },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ 'preferences.location': '2dsphere' });
UserSchema.index({ name: 'text' });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);