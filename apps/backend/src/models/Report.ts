import mongoose, { Schema, Document } from 'mongoose';

type ReportType = 'listing' | 'owner' | 'user';
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface IReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    reportedUserId: mongoose.Types.ObjectId;
    reportType: ReportType;
    targetId: string; // ID of listing or user being reported
    description: string;
    status: ReportStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, enum: ['listing', 'owner', 'user'], required: true },
    targetId: { type: String, required: true },
    description: { type: String, required: true, minlength: 10, maxlength: 500 },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IReport>('Report', ReportSchema);
