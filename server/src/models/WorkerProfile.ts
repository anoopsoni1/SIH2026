import { Schema, model, Document, Types } from 'mongoose';
import { WorkerVerificationStatus } from '../../../shared/src/index';
import './Society';
import './User';

export interface IWorkerSkillSchema {
  serviceId: Types.ObjectId;
  serviceName: string;
  experienceYears: number;
  isPrimary: boolean;
}

export interface IWorkerCertificateSchema {
  title: string;
  issuingAuthority: string;
  documentUrl: string;
  verified: boolean;
  issuedDate?: Date;
}

export interface IWorkerProfileDocument extends Document {
  userId: Types.ObjectId;
  societyId: Types.ObjectId;
  skills: IWorkerSkillSchema[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  serviceRadiusKm: number;
  verificationStatus: WorkerVerificationStatus;
  govtIdType: string;
  govtIdNumberMasked: string; // Masked for privacy e.g. XXXX-XXXX-1234
  certificates: IWorkerCertificateSchema[];
  profilePhotoUrl?: string;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  activeJobsCount: number;
  maxDailyJobs: number;
  ratingAverage: number;
  ratingCount: number;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiryDate?: Date;
  welfareEnrolled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workerSkillSchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceName: { type: String, required: true },
  experienceYears: { type: Number, required: true, default: 1 },
  isPrimary: { type: Boolean, default: false },
});

const workerCertificateSchema = new Schema({
  title: { type: String, required: true },
  issuingAuthority: { type: String, required: true },
  documentUrl: { type: String, required: true },
  verified: { type: Boolean, default: false },
  issuedDate: { type: Date },
});

const workerProfileSchema = new Schema<IWorkerProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    skills: [workerSkillSchema],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    serviceRadiusKm: { type: Number, default: 15 },
    verificationStatus: {
      type: String,
      enum: Object.values(WorkerVerificationStatus),
      default: WorkerVerificationStatus.PENDING_VERIFICATION,
      index: true,
    },
    govtIdType: { type: String, required: true, default: 'Aadhaar' },
    govtIdNumberMasked: { type: String, required: true },
    certificates: [workerCertificateSchema],
    profilePhotoUrl: { type: String },
    isAvailable: { type: Boolean, default: true, index: true },
    isEmergencyAvailable: { type: Boolean, default: false, index: true },
    activeJobsCount: { type: Number, default: 0, min: 0 },
    maxDailyJobs: { type: Number, default: 5 },
    ratingAverage: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
    ratingCount: { type: Number, default: 0 },
    insurancePolicyNumber: { type: String },
    insuranceProvider: { type: String },
    insuranceExpiryDate: { type: Date },
    welfareEnrolled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Crucial 2dsphere index for geospatial matching & spatial queries
workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ verificationStatus: 1, isAvailable: 1 });
workerProfileSchema.index({ 'skills.serviceId': 1, verificationStatus: 1 });

export const WorkerProfile = model<IWorkerProfileDocument>('WorkerProfile', workerProfileSchema);
