import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedSearch extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    filters: any;
    createdAt: Date;
}

const SavedSearchSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

SavedSearchSchema.index({ userId: 1 });

export default mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema);
