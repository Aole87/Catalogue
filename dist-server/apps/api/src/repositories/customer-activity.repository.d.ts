import { CustomerActivityType, Prisma } from '@prisma/client';
export interface CreateCustomerActivityData {
    customerId?: string | null;
    userId?: string | null;
    eventType: CustomerActivityType;
    description: string;
    metadata?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
}
export declare class CustomerActivityRepository {
    /**
     * Append-only log of customer activity.
     */
    static recordActivity(data: CreateCustomerActivityData): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: Prisma.JsonValue | null;
        customerId: string | null;
    }>;
    /**
     * List customer activity timeline with pagination.
     */
    static listByCustomerId(customerId: string, limit?: number, skip?: number): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: Prisma.JsonValue;
        customerId: string | null;
    }[]>;
    /**
     * List user activity timeline with pagination.
     */
    static listByUserId(userId: string, limit?: number, skip?: number): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: Prisma.JsonValue;
    }[]>;
}
