import { Schema, model, Document, Types } from 'mongoose';

export interface IServiceDocument extends Document {
  categoryId: Types.ObjectId;
  name: string;
  nameHi?: string;
  description: string;
  basePrice: number;
  unitType: 'per_hour' | 'fixed';
  estimatedDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true, index: true },
    name: { type: String, required: true, trim: true },
    nameHi: { type: String, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    unitType: { type: String, enum: ['per_hour', 'fixed'], default: 'fixed' },
    estimatedDurationMinutes: { type: Number, required: true, default: 60 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

serviceSchema.index({ categoryId: 1, isActive: 1 });

export const Service = model<IServiceDocument>('Service', serviceSchema);
