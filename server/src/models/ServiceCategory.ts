import { Schema, model, Document } from 'mongoose';

export interface IServiceCategoryDocument extends Document {
  name: string;
  nameHi?: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategoryDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    nameHi: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    icon: { type: String, required: true, default: 'Wrench' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const ServiceCategory = model<IServiceCategoryDocument>('ServiceCategory', serviceCategorySchema);
