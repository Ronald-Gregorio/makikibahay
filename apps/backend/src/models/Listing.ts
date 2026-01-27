import mongoose, { Schema, Document } from 'mongoose';
import type { Listing } from '@makikibahay/types';

export interface IListingDocument extends Omit<Listing, '_id'>, Document {}

const LocationSchema = new Schema({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true }, // [lng, lat] - longitude first, latitude second for GeoJSON
}, { _id: false });

const ListingSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, minlength: 1 },
  address: { type: String, required: true, trim: true, minlength: 1 },
  location: { type: LocationSchema, required: true, index: '2dsphere' },
  totalRooms: { type: Number, required: true, min: 1 },
  availableRooms: { type: Number, required: true, min: 0 },
  priceMin: { type: Number, required: true, min: 0 },
  priceMax: { type: Number, required: true, min: 0 },
  rules: [{ type: String }],
  amenities: [{ type: String }],
  coverPhoto: { type: String, validate: { validator: (v: string) => !v || /^https?:\/\/.+/.test(v), message: 'Invalid URL format' } },
  photos: [{ type: String, validate: { validator: (v: string) => !v || /^https?:\/\/.+/.test(v), message: 'Invalid URL format' } }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ListingSchema.index({ location: '2dsphere' });
ListingSchema.index({ name: 'text', address: 'text' });
ListingSchema.index({ ownerId: 1 });
ListingSchema.index({ priceMin: 1, priceMax: 1 });

export const ListingModel = mongoose.model<IListingDocument>('Listing', ListingSchema);