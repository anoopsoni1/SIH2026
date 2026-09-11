export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  WORKER = 'WORKER',
  SOCIETY_ADMIN = 'SOCIETY_ADMIN',
  FEDERATION_ADMIN = 'FEDERATION_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum WorkerVerificationStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  AWAITING_WORKER = 'AWAITING_WORKER',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WORKER_ON_THE_WAY = 'WORKER_ON_THE_WAY',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  CUSTOMER_CONFIRMED = 'CUSTOMER_CONFIRMED',
  CANCELLED_BY_CUSTOMER = 'CANCELLED_BY_CUSTOMER',
  CANCELLED_BY_WORKER = 'CANCELLED_BY_WORKER',
  CANCELLED_BY_ADMIN = 'CANCELLED_BY_ADMIN',
  CANCELLED_BY_SYSTEM = 'CANCELLED_BY_SYSTEM',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

export enum BookingType {
  STANDARD = 'STANDARD',
  EMERGENCY = 'EMERGENCY',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  location: GeoPoint;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  language: 'en' | 'hi';
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface ISociety {
  _id: string;
  name: string;
  code: string;
  region: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  adminIds: string[];
}

export interface IWorkerSkill {
  serviceId: string;
  serviceName: string;
  experienceYears: number;
  isPrimary: boolean;
}

export interface IWorkerCertificate {
  _id?: string;
  title: string;
  issuingAuthority: string;
  documentUrl: string;
  verified: boolean;
  issuedDate?: string;
}

export interface IWorkerProfile {
  _id: string;
  userId: IUser | string;
  societyId: ISociety | string;
  skills: IWorkerSkill[];
  location: GeoPoint;
  serviceRadiusKm: number;
  verificationStatus: WorkerVerificationStatus;
  govtIdType: string;
  govtIdNumberMasked: string;
  certificates: IWorkerCertificate[];
  profilePhotoUrl?: string;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  activeJobsCount: number;
  maxDailyJobs: number;
  ratingAverage: number;
  ratingCount: number;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiryDate?: string;
  welfareEnrolled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IServiceCategory {
  _id: string;
  name: string;
  nameHi?: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface IService {
  _id: string;
  categoryId: IServiceCategory | string;
  name: string;
  nameHi?: string;
  description: string;
  basePrice: number;
  unitType: 'per_hour' | 'fixed';
  estimatedDurationMinutes: number;
  isActive: boolean;
}

export interface IPaymentBreakdown {
  grossAmount: number;
  workerEarnings: number;
  cooperativeContribution: number;
  platformFee: number;
  taxes: number;
}

export interface IBooking {
  _id: string;
  bookingNumber: string;
  customerId: IUser | string;
  workerId?: IWorkerProfile | string;
  serviceId: IService | string;
  bookingType: BookingType;
  status: BookingStatus;
  serviceLocation: Address;
  scheduledDate: string;
  scheduledTimeSlot: string;
  problemDescription?: string;
  attachments?: string[];
  pricing: IPaymentBreakdown;
  startOtp?: string;
  completionOtp?: string;
  completionProofPhotos?: string[];
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  _id: string;
  bookingId: string;
  customerId: string;
  workerId?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  breakdown: IPaymentBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface IRating {
  _id: string;
  bookingId: string;
  customerId: string;
  workerId: string;
  overallRating: number;
  punctualityRating: number;
  qualityRating: number;
  professionalismRating: number;
  comment?: string;
  moderationStatus: 'APPROVED' | 'FLAGGED';
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  timestamp: string;
}

export interface IDemandForecast {
  zoneId: string;
  serviceCategory: string;
  forecastDate: string;
  predictedDemand: number;
  currentAvailableWorkers: number;
  workforceGap: number;
  peakHours: string[];
  explainability: string;
}
