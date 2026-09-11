import { Schema, model, Document, Types } from 'mongoose';
import { BookingStatus, BookingType } from '../../../shared/src/index';

export interface IBookingDocument extends Document {
  bookingNumber: string;
  customerId: Types.ObjectId;
  workerId?: Types.ObjectId;
  serviceId: Types.ObjectId;
  bookingType: BookingType;
  status: BookingStatus;
  serviceLocation: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  scheduledDate: Date;
  scheduledTimeSlot: string;
  problemDescription?: string;
  attachments?: string[];
  pricing: {
    grossAmount: number;
    workerEarnings: number;
    cooperativeContribution: number;
    platformFee: number;
    taxes: number;
  };
  startOtp?: string;
  completionOtp?: string;
  completionProofPhotos?: string[];
  cancelledReason?: string;
  cancelledByRole?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile', index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    bookingType: { type: String, enum: Object.values(BookingType), default: BookingType.STANDARD, index: true },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING_PAYMENT, index: true },
    serviceLocation: {
      label: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
    },
    scheduledDate: { type: Date, required: true, index: true },
    scheduledTimeSlot: { type: String, required: true },
    problemDescription: { type: String },
    attachments: [{ type: String }],
    pricing: {
      grossAmount: { type: Number, required: true },
      workerEarnings: { type: Number, required: true },
      cooperativeContribution: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      taxes: { type: Number, required: true },
    },
    startOtp: { type: String },
    completionOtp: { type: String },
    completionProofPhotos: [{ type: String }],
    cancelledReason: { type: String },
    cancelledByRole: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ workerId: 1, status: 1 });
bookingSchema.index({ 'serviceLocation.location': '2dsphere' });

export const Booking = model<IBookingDocument>('Booking', bookingSchema);
