import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    roomId: string;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    listingId: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    isTrashed: boolean;
    sentAt: Date;
}

const MessageSchema: Schema = new Schema({
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: false },
    content: { type: String, required: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now }
});

MessageSchema.index({ roomId: 1, sentAt: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
