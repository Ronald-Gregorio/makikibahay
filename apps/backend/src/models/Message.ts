import mongoose, { Schema, Document } from 'mongoose';
import type { Message } from '@makikibahay/types';

export interface IMessageDocument extends Omit<Message, '_id'>, Document {}

const MessageSchema = new Schema({
  roomId: { 
    type: String, 
    required: true, 
    match: [/^listing_\d+_user_\d+_owner_\d+$/, 'Invalid room ID format']
  },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  sentAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

MessageSchema.index({ roomId: 1, sentAt: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ listingId: 1 });

export const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);