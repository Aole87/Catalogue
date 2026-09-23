import { ShipmentStatus, Prisma } from '@prisma/client';
export interface CreateShipmentParams {
    shipmentNumber: string;
    orderId: string;
    shippingMethodId?: string | null;
    carrier?: string | null;
    serviceLevel?: string | null;
    shippingCost?: string;
    currency?: string;
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province: string;
    postalCode: string;
    country?: string;
    addressSnapshot?: any;
    metadata?: any;
    actorId?: string | null;
}
export interface UpdateShipmentStatusParams {
    shipmentId: string;
    toStatus: ShipmentStatus;
    description?: string;
    location?: string;
    providerEventId?: string;
    actorId?: string | null;
    occurredAt?: Date;
    metadata?: any;
}
export interface AssignTrackingParams {
    shipmentId: string;
    trackingNumber: string;
    carrier?: string;
    serviceLevel?: string;
    actorId?: string | null;
}
export declare class ShippingRepository {
    private static shipmentIncludes;
    /**
     * Retrieves all active shipping methods.
     */
    static listShippingMethods(isActive?: boolean): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        carrier: string | null;
        basePrice: Prisma.Decimal;
        estimatedMinDays: number;
        estimatedMaxDays: number;
    }[]>;
    static findShippingMethodById(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        carrier: string | null;
        basePrice: Prisma.Decimal;
        estimatedMinDays: number;
        estimatedMaxDays: number;
    } | null>;
    static findShippingMethodByCode(code: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        carrier: string | null;
        basePrice: Prisma.Decimal;
        estimatedMinDays: number;
        estimatedMaxDays: number;
    } | null>;
    /**
     * Atomically creates a Shipment and its initial ShippingEvent.
     */
    static createShipment(params: CreateShipmentParams): Promise<{
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }>;
    static findById(id: string): Promise<({
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    static findByShipmentNumber(shipmentNumber: string): Promise<({
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    static findByTrackingNumber(trackingNumber: string): Promise<({
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    static findByOrderId(orderId: string): Promise<({
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    })[]>;
    /**
     * Atomically updates shipment status, resolves order status, and logs audit events.
     */
    static updateShipmentStatus(params: UpdateShipmentStatusParams): Promise<({
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    /**
     * Assigns tracking number to a shipment.
     */
    static assignTracking(params: AssignTrackingParams): Promise<({
        order: {
            customer: ({
                user: {
                    passwordHash: string;
                    id: string;
                    email: string;
                    phone: string | null;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                    isActive: boolean;
                    emailVerifiedAt: Date | null;
                    phoneVerifiedAt: Date | null;
                    lastLoginAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            currency: string;
            subtotal: Prisma.Decimal;
            discountTotal: Prisma.Decimal;
            taxTotal: Prisma.Decimal;
            grandTotal: Prisma.Decimal;
            customerId: string | null;
            orderNumber: string;
            shippingTotal: Prisma.Decimal;
            promotionId: string | null;
            couponCode: string | null;
            loyaltyPointsRedeemed: number;
            loyaltyPointsEarned: number;
            promotionSnapshot: Prisma.JsonValue | null;
            customerNotes: string | null;
            adminNotes: string | null;
        };
        shippingMethod: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            carrier: string | null;
            basePrice: Prisma.Decimal;
            estimatedMinDays: number;
            estimatedMaxDays: number;
        } | null;
        events: {
            location: string | null;
            description: string;
            id: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            actorId: string | null;
            shipmentId: string;
            providerEventId: string | null;
            occurredAt: Date;
            receivedAt: Date;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        id: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.ShipmentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        shippingCost: Prisma.Decimal;
        recipientName: string | null;
        addressLine1: string | null;
        addressLine2: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        country: string;
        shipmentNumber: string;
        shippingMethodId: string | null;
        trackingNumber: string | null;
        carrier: string | null;
        serviceLevel: string | null;
        addressSnapshot: Prisma.JsonValue | null;
        estimatedDelivery: Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    }) | null>;
    /**
     * Idempotently records courier webhook event with P2002 collision protection.
     */
    static recordWebhookEvent(provider: string, eventId: string, eventType: string, payload: any): Promise<{
        isDuplicate: boolean;
        webhookEvent: {
            id: string;
            createdAt: Date;
            status: string;
            eventType: string;
            payload: Prisma.JsonValue;
            provider: string;
            eventId: string;
            processedAt: Date | null;
        };
    }>;
    static markWebhookProcessed(id: string, status?: 'PROCESSED' | 'FAILED'): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        eventType: string;
        payload: Prisma.JsonValue;
        provider: string;
        eventId: string;
        processedAt: Date | null;
    }>;
    /**
     * Paged query for staff admin fulfillment dashboard.
     */
    static findAdminShipments(params: {
        status?: ShipmentStatus;
        carrier?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        shipments: ({
            order: {
                customer: ({
                    user: {
                        passwordHash: string;
                        id: string;
                        email: string;
                        phone: string | null;
                        firstName: string;
                        lastName: string;
                        displayName: string | null;
                        isActive: boolean;
                        emailVerifiedAt: Date | null;
                        phoneVerifiedAt: Date | null;
                        lastLoginAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                        deletedAt: Date | null;
                    } | null;
                } & {
                    id: string;
                    phone: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    userId: string | null;
                    notes: string | null;
                    customerType: import(".prisma/client").$Enums.CustomerType;
                    companyName: string | null;
                    taxId: string | null;
                    isVerified: boolean;
                }) | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.OrderStatus;
                currency: string;
                subtotal: Prisma.Decimal;
                discountTotal: Prisma.Decimal;
                taxTotal: Prisma.Decimal;
                grandTotal: Prisma.Decimal;
                customerId: string | null;
                orderNumber: string;
                shippingTotal: Prisma.Decimal;
                promotionId: string | null;
                couponCode: string | null;
                loyaltyPointsRedeemed: number;
                loyaltyPointsEarned: number;
                promotionSnapshot: Prisma.JsonValue | null;
                customerNotes: string | null;
                adminNotes: string | null;
            };
            shippingMethod: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                code: string;
                carrier: string | null;
                basePrice: Prisma.Decimal;
                estimatedMinDays: number;
                estimatedMaxDays: number;
            } | null;
            events: {
                location: string | null;
                description: string;
                id: string;
                status: import(".prisma/client").$Enums.ShipmentStatus;
                actorId: string | null;
                shipmentId: string;
                providerEventId: string | null;
                occurredAt: Date;
                receivedAt: Date;
                metadata: Prisma.JsonValue | null;
            }[];
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.ShipmentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            shippingCost: Prisma.Decimal;
            recipientName: string | null;
            addressLine1: string | null;
            addressLine2: string | null;
            subdistrict: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            country: string;
            shipmentNumber: string;
            shippingMethodId: string | null;
            trackingNumber: string | null;
            carrier: string | null;
            serviceLevel: string | null;
            addressSnapshot: Prisma.JsonValue | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
