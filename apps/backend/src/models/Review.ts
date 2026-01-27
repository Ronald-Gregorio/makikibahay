import mongoose, { Schema, Document } from 'mongoose';
import type { Review } from '@makikibahay/types';

export interface IReviewDocument extends Omit<Review, '_id'>, Document {}

const ReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ReviewSchema.index({ listingId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ listingId: 1 });

export const ReviewModel = mongoose.model<IReviewDocument>('Review', ReviewSchema);