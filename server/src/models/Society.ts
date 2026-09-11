import { Schema, model, Document, Types } from 'mongoose';

export interface ISocietyDocument extends Document {
  name: string;
  code: string;
  region: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  adminIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const societySchema = new Schema<ISocietyDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    region: { type: String, required: true, index: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    adminIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Society = model<ISocietyDocument>('Society', societySchema);
