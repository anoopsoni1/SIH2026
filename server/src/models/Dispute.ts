import { Schema, model, Document, Types } from 'mongoose';

export interface IDisputeDocument extends Document {
  bookingId: Types.ObjectId;
  raisedByUserId: Types.ObjectId;
  reason: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolutionNotes?: string;
  resolvedByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDisputeDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    raisedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'], default: 'OPEN', index: true },
    resolutionNotes: { type: String },
    resolvedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Dispute = model<IDisputeDocument>('Dispute', disputeSchema);
