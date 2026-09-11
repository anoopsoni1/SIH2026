import { Schema, model, Document, Types } from 'mongoose';
import { PaymentStatus } from '../shared/index';

export interface IPaymentDocument extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  workerId?: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  breakdown: {
    grossAmount: number;
    workerEarnings: number;
    cooperativeContribution: number;
    platformFee: number;
    taxes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile' },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.CREATED, index: true },
    breakdown: {
      grossAmount: { type: Number, required: true },
      workerEarnings: { type: Number, required: true },
      cooperativeContribution: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      taxes: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
