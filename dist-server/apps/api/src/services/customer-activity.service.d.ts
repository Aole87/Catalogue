import { CreateCustomerActivityData } from '../repositories/customer-activity.repository';
import { CustomerActivityType } from '@prisma/client';
export declare class CustomerActivityService {
    /**
     * Records a customer activity event asynchronously without blocking caller.
     */
    static record(data: CreateCustomerActivityData): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
    } | null>;
    /**
     * Helper for recording account created.
     */
    static onAccountCreated(userId: string, customerId?: string | null): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
    } | null>;
    /**
     * Helper for recording order lifecycle events.
     */
    static onOrderEvent(eventType: CustomerActivityType, orderId: string, orderNumber: string, customerId?: string | null, userId?: string | null, grandTotal?: string | number): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
    } | null>;
    /**
     * Helper for recording promotion / loyalty events.
     */
    static onPromotionEvent(eventType: CustomerActivityType, description: string, customerId?: string | null, userId?: string | null, metadata?: any): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        eventType: import(".prisma/client").$Enums.CustomerActivityType;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
    } | null>;
}
