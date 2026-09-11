import { AuditLog } from '../models/AuditLog';
import { UserRole } from '../shared/index';

export class AuditService {
  static async logAction(params: {
    actorId: string;
    actorRole: UserRole;
    action: string;
    entity: string;
    entityId: string;
    previousState?: any;
    newState?: any;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await AuditLog.create({
        actorId: params.actorId,
        actorRole: params.actorRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        previousState: params.previousState,
        newState: params.newState,
        ipAddress: params.ipAddress,
        timestamp: new Date(),
      });
    } catch (err) {
      // Audit log failures should be recorded in server logs without throwing uncaught error to user
      console.error('Audit Log Error:', err);
    }
  }
}
