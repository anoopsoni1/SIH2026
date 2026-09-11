import { Schema, model, Document, Types } from 'mongoose';
import { UserRole } from '../../../shared/src/index';

export interface IAuditLogDocument extends Document {
  actorId: Types.ObjectId;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, enum: Object.values(UserRole), required: true, index: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const AuditLog = model<IAuditLogDocument>('AuditLog', auditLogSchema);
