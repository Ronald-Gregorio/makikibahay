import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
    reportId: mongoose.Types.ObjectId;
    assignedAdminId?: mongoose.Types.ObjectId;
    notes?: string;
    resolution?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema({
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    resolution: { type: String },
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
