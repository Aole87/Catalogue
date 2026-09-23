import { ShipmentStatus } from '@prisma/client';
export interface CreateShipmentInput {
    orderId: string;
    shippingMethodId?: string;
    carrier?: string;
    serviceLevel?: string;
    recipientName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    shippingCost?: string;
    actorId?: string;
    userRoles?: string[];
}
export interface UpdateShipmentStatusInput {
    shipmentId: string;
    toStatus: ShipmentStatus;
    description?: string;
    location?: string;
    providerEventId?: string;
    actorId?: string;
    userRoles?: string[];
    occurredAt?: Date;
    metadata?: any;
}
export interface AssignTrackingInput {
    shipmentId: string;
    trackingNumber: string;
    carrier?: string;
    serviceLevel?: string;
    actorId?: string;
    userRoles?: string[];
}
export declare class ShippingService {
    /**
     * Generates a unique, non-guessable internal shipment number.
     */
    private static generateShipmentNumber;
    /**
     * Formats shipment data for internal & staff API responses.
     */
    static formatShipmentResponse(shipment: any): {
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null;
    /**
     * Formats customer-facing tracking response with masked sensitive recipient data.
     */
    static formatTrackingResponse(shipment: any): {
        shipmentNumber: any;
        trackingNumber: any;
        carrier: any;
        serviceLevel: any;
        status: any;
        recipientSummary: {
            name: any;
            phone: any;
            province: any;
            postalCode: any;
        };
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        events: any;
    } | null;
    /**
     * Authorizes that a user owns the order linked to a shipment, or has staff/admin privileges.
     */
    private static verifyOrderOwnership;
    /**
     * Lists available shipping methods.
     */
    static getShippingMethods(isActive?: boolean): Promise<{
        id: string;
        name: string;
        code: string;
        carrier: string | null;
        description: string | null;
        basePrice: string;
        estimatedMinDays: number;
        estimatedMaxDays: number;
        isActive: boolean;
    }[]>;
    /**
     * Creates a shipment for an order.
     * STRICT PAYMENT BOUNDARY: Only PAYMENT_CONFIRMED or authorized COD orders can be fulfilled.
     */
    static createShipment(input: CreateShipmentInput): Promise<{
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null>;
    /**
     * Updates shipment status following strict state machine rules.
     */
    static updateShipmentStatus(input: UpdateShipmentStatusInput): Promise<{
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null>;
    /**
     * Assigns tracking number to a shipment.
     */
    static assignTracking(input: AssignTrackingInput): Promise<{
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null>;
    /**
     * Inbound carrier tracking webhook ingestion with signature verification,
     * deduplication, out-of-order stale event protection, and shipment status update.
     */
    static handleTrackingWebhook(providerName: string, rawBody: any, headers: Record<string, any>): Promise<{
        success: boolean;
        duplicate: boolean;
        message: string;
        providerEventId: string;
        processed?: undefined;
        shipmentId?: undefined;
        status?: undefined;
        trackingNumber?: undefined;
    } | {
        success: boolean;
        processed: boolean;
        shipmentId: string;
        status: "DELIVERED" | "RETURNED" | "FAILED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY";
        providerEventId: string;
        duplicate?: undefined;
        message?: undefined;
        trackingNumber?: undefined;
    } | {
        success: boolean;
        processed: boolean;
        message: string;
        trackingNumber: string;
        duplicate?: undefined;
        providerEventId?: undefined;
        shipmentId?: undefined;
        status?: undefined;
    }>;
    /**
     * Cancels a shipment.
     */
    static cancelShipment(shipmentId: string, reason: string, actorId?: string): Promise<{
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null>;
    /**
     * Retrieves shipment by ID with IDOR protection.
     */
    static getShipmentById(shipmentId: string, userId?: string, userRoles?: string[]): Promise<{
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null>;
    /**
     * Retrieves shipments for an order with IDOR protection.
     */
    static getShipmentsByOrderId(orderId: string, userId?: string, userRoles?: string[]): Promise<({
        id: any;
        shipmentNumber: any;
        orderId: any;
        shippingMethodId: any;
        carrier: any;
        serviceLevel: any;
        trackingNumber: any;
        status: any;
        shippingCost: string;
        currency: any;
        recipientName: any;
        phone: any;
        addressLine1: any;
        addressLine2: any;
        subdistrict: any;
        district: any;
        province: any;
        postalCode: any;
        country: any;
        addressSnapshot: any;
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        shippingMethod: {
            id: any;
            name: any;
            code: any;
            carrier: any;
            basePrice: string;
            estimatedMinDays: any;
            estimatedMaxDays: any;
        } | undefined;
        events: any;
    } | null)[]>;
    /**
     * Public tracking lookup by tracking number. Masks customer details.
     */
    static getShipmentTracking(trackingNumber: string): Promise<{
        shipmentNumber: any;
        trackingNumber: any;
        carrier: any;
        serviceLevel: any;
        status: any;
        recipientSummary: {
            name: any;
            phone: any;
            province: any;
            postalCode: any;
        };
        estimatedDelivery: any;
        shippedAt: any;
        deliveredAt: any;
        events: any;
    } | null>;
    /**
     * Staff query for admin fulfillment dashboard.
     */
    static getAdminShipments(params: {
        status?: ShipmentStatus;
        carrier?: string;
        page?: number;
        limit?: number;
    }, userRoles?: string[]): Promise<{
        shipments: ({
            id: any;
            shipmentNumber: any;
            orderId: any;
            shippingMethodId: any;
            carrier: any;
            serviceLevel: any;
            trackingNumber: any;
            status: any;
            shippingCost: string;
            currency: any;
            recipientName: any;
            phone: any;
            addressLine1: any;
            addressLine2: any;
            subdistrict: any;
            district: any;
            province: any;
            postalCode: any;
            country: any;
            addressSnapshot: any;
            estimatedDelivery: any;
            shippedAt: any;
            deliveredAt: any;
            createdAt: any;
            updatedAt: any;
            order: {
                id: any;
                orderNumber: any;
                status: any;
                grandTotal: string;
                currency: any;
            } | undefined;
            shippingMethod: {
                id: any;
                name: any;
                code: any;
                carrier: any;
                basePrice: string;
                estimatedMinDays: any;
                estimatedMaxDays: any;
            } | undefined;
            events: any;
        } | null)[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
