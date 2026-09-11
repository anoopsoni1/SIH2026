import { Schema, model, Document, Types } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  titleHi?: string;
  message: string;
  messageHi?: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    titleHi: { type: String },
    message: { type: String, required: true },
    messageHi: { type: String },
    type: { type: String, required: true, default: 'SYSTEM' },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = model<INotificationDocument>('Notification', notificationSchema);
