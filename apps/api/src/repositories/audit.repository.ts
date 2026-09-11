import { prisma } from '@car-parts/database';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditRepository {
  static async record(data: CreateAuditLogData) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          before: (data.before as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          after: (data.after as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (err) {
      // Audit log failures should not crash the main business operation, but should be logged
      console.error('Failed to record audit log:', err);
      return null;
    }
  }
}
