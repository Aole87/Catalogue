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
export declare class AuditRepository {
    static record(data: CreateAuditLogData): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        before: Prisma.JsonValue | null;
        after: Prisma.JsonValue | null;
    } | null>;
}
