import mongoose, { Schema, Document } from 'mongoose';
import type { Report, Ticket } from '@makikibahay/types';

export interface IReportDocument extends Omit<Report, '_id'>, Document {}

const ReportSchema = new Schema({
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportType: { type: String, enum: ['listing', 'owner', 'user'], required: true },
  targetId: { type: String, required: true },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ReportSchema.index({ status: 1 });
ReportSchema.index({ reporterId: 1, createdAt: -1 });
ReportSchema.index({ reportedUserId: 1 });

export const ReportModel = mongoose.model<IReportDocument>('Report', ReportSchema);

export interface ITicketDocument extends Omit<Ticket, '_id'>, Document {}

const TicketSchema = new Schema({
  reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
  assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, trim: true },
  resolution: { type: String, trim: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

TicketSchema.index({ reportId: 1 });
TicketSchema.index({ assignedAdminId: 1 });

export const TicketModel = mongoose.model<ITicketDocument>('Ticket', TicketSchema);