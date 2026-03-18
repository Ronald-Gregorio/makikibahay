import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
    key: string;
    value: any;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SettingSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
}, { timestamps: true });

SettingSchema.index({ key: 1 });

export default mongoose.model<ISetting>('Setting', SettingSchema);
