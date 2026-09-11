import { Schema, model, Document, Types } from 'mongoose';

export interface IRatingDocument extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  workerId: Types.ObjectId;
  overallRating: number;
  punctualityRating: number;
  qualityRating: number;
  professionalismRating: number;
  comment?: string;
  moderationStatus: 'APPROVED' | 'FLAGGED';
  createdAt: Date;
}

const ratingSchema = new Schema<IRatingDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile', required: true, index: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    punctualityRating: { type: Number, required: true, min: 1, max: 5 },
    qualityRating: { type: Number, required: true, min: 1, max: 5 },
    professionalismRating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, max: 1000 },
    moderationStatus: { type: String, enum: ['APPROVED', 'FLAGGED'], default: 'APPROVED', index: true },
  },
  { timestamps: true }
);

export const Rating = model<IRatingDocument>('Rating', ratingSchema);
