import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../shared/index';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  role: UserRole;
  language: 'en' | 'hi';
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  addresses?: Array<{
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  }>;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema({
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
});

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    mobile: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER, index: true },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    addresses: [addressSchema],
    refreshTokenHash: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUserDocument>('User', userSchema);
