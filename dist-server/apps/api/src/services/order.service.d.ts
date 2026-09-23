import { AdminOrderQueryParams, CustomerOrderQueryParams } from '../repositories/order.repository';
import { OrderStatus } from '@prisma/client';
export interface ShippingAddressInput {
    recipientName: string;
    phone: string;
    addressLine: string;
    subdistrict?: string;
    district?: string;
    province: string;
    postalCode: string;
}
export interface CheckoutInput {
    userId?: string;
    sessionToken?: string;
    shippingAddress: ShippingAddressInput;
    customerNotes?: string;
    paymentMethod?: string;
    couponCode?: string;
    loyaltyPointsToRedeem?: number;
}
export declare class OrderService {
    /**
     * Generates a unique, standardized order number with date prefix.
     */
    private static generateOrderNumber;
    /**
     * Formats order output for API responses.
     */
    static formatOrderResponse(order: any): {
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null;
    /**
     * Masks sensitive PII string (e.g. names, addresses).
     */
    private static maskString;
    /**
     * Masks email address (e.g. somchai@autoworkshop.com -> s***@***.com).
     */
    private static maskEmail;
    /**
     * Masks phone number (e.g. 0812345678 -> 081-***-5678).
     */
    private static maskPhone;
    /**
     * Formats public/guest confirmation view with strict PII masking and zero internal audit leakage.
     */
    static formatPublicOrderConfirmation(order: any): {
        id: any;
        orderNumber: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        isPublicConfirmation: boolean;
        createdAt: any;
        updatedAt: any;
        customer: {
            customerType: any;
            companyName: string | undefined;
            phone: string | undefined;
            user: {
                email: string;
                displayName: string;
            } | undefined;
        } | undefined;
        shippingAddress: {
            recipientName: string;
            phone: string;
            addressLine: string;
            province: any;
            postalCode: any;
        } | null;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null;
    /**
     * Authorizes that a user owns the order or has staff/admin privileges.
     */
    private static verifyOrderOwnership;
    /**
     * Executes atomic checkout from the active cart with server-authoritative pricing.
     */
    static checkout(input: CheckoutInput): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Retrieves order by ID with IDOR protection.
     */
    static getOrderById(orderId: string, userId?: string, userRoles?: string[]): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | {
        id: any;
        orderNumber: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        isPublicConfirmation: boolean;
        createdAt: any;
        updatedAt: any;
        customer: {
            customerType: any;
            companyName: string | undefined;
            phone: string | undefined;
            user: {
                email: string;
                displayName: string;
            } | undefined;
        } | undefined;
        shippingAddress: {
            recipientName: string;
            phone: string;
            addressLine: string;
            province: any;
            postalCode: any;
        } | null;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Retrieves order by human-readable order number with IDOR protection.
     */
    static getOrderByNumber(orderNumber: string, userId?: string, userRoles?: string[]): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | {
        id: any;
        orderNumber: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        isPublicConfirmation: boolean;
        createdAt: any;
        updatedAt: any;
        customer: {
            customerType: any;
            companyName: string | undefined;
            phone: string | undefined;
            user: {
                email: string;
                displayName: string;
            } | undefined;
        } | undefined;
        shippingAddress: {
            recipientName: string;
            phone: string;
            addressLine: string;
            province: any;
            postalCode: any;
        } | null;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Retrieves customer orders with optional filters and pagination.
     */
    static getCustomerOrders(userId: string, query?: CustomerOrderQueryParams): Promise<{
        orders: ({
            id: any;
            orderNumber: any;
            customerId: any;
            status: any;
            currency: any;
            subtotal: string;
            discountTotal: string;
            shippingTotal: string;
            taxTotal: string;
            grandTotal: string;
            promotionId: any;
            couponCode: any;
            loyaltyPointsRedeemed: any;
            loyaltyPointsEarned: any;
            promotionSnapshot: any;
            customerNotes: any;
            adminNotes: any;
            createdAt: any;
            updatedAt: any;
            customer: {
                id: any;
                customerType: any;
                companyName: any;
                phone: any;
                user: {
                    id: any;
                    email: any;
                    firstName: any;
                    lastName: any;
                    displayName: any;
                } | undefined;
            } | undefined;
            shippingAddress: any;
            items: any;
            statusHistory: any;
            payments: any;
            shipments: any;
        } | null)[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Synthesizes authoritative chronological order timeline from OrderStatusHistory,
     * PaymentEvents, and ShippingEvents.
     */
    static getOrderTimeline(orderId: string, userId?: string, userRoles?: string[]): Promise<{
        type: "ORDER" | "PAYMENT" | "SHIPPING";
        title: string;
        description?: string;
        status: string;
        occurredAt: Date;
    }[]>;
    /**
     * Customer cancels an order within allowed policies.
     */
    static cancelOrderByCustomer(orderId: string, reason: string, userId: string): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Staff cancels an order with reason and audit.
     */
    static cancelOrderByStaff(orderId: string, reason: string, staffUserId: string, userRoles?: string[]): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Customer requests a return for a delivered order.
     */
    static requestReturn(orderId: string, reason: string, userId: string): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Staff approves or rejects a return request.
     */
    static handleReturnActionByStaff(orderId: string, action: 'APPROVE' | 'REJECT', note: string | undefined, staffUserId: string, userRoles?: string[]): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Staff updates order status explicitly through state machine rules.
     */
    static updateOrderStatusByStaff(orderId: string, toStatus: OrderStatus, note: string | undefined, staffUserId: string, userRoles?: string[]): Promise<{
        id: any;
        orderNumber: any;
        customerId: any;
        status: any;
        currency: any;
        subtotal: string;
        discountTotal: string;
        shippingTotal: string;
        taxTotal: string;
        grandTotal: string;
        promotionId: any;
        couponCode: any;
        loyaltyPointsRedeemed: any;
        loyaltyPointsEarned: any;
        promotionSnapshot: any;
        customerNotes: any;
        adminNotes: any;
        createdAt: any;
        updatedAt: any;
        customer: {
            id: any;
            customerType: any;
            companyName: any;
            phone: any;
            user: {
                id: any;
                email: any;
                firstName: any;
                lastName: any;
                displayName: any;
            } | undefined;
        } | undefined;
        shippingAddress: any;
        items: any;
        statusHistory: any;
        payments: any;
        shipments: any;
    } | null>;
    /**
     * Staff query with full search, status filters, date ranges, and pagination.
     */
    static getAdminOrders(query: AdminOrderQueryParams, userRoles?: string[]): Promise<{
        orders: ({
            id: any;
            orderNumber: any;
            customerId: any;
            status: any;
            currency: any;
            subtotal: string;
            discountTotal: string;
            shippingTotal: string;
            taxTotal: string;
            grandTotal: string;
            promotionId: any;
            couponCode: any;
            loyaltyPointsRedeemed: any;
            loyaltyPointsEarned: any;
            promotionSnapshot: any;
            customerNotes: any;
            adminNotes: any;
            createdAt: any;
            updatedAt: any;
            customer: {
                id: any;
                customerType: any;
                companyName: any;
                phone: any;
                user: {
                    id: any;
                    email: any;
                    firstName: any;
                    lastName: any;
                    displayName: any;
                } | undefined;
            } | undefined;
            shippingAddress: any;
            items: any;
            statusHistory: any;
            payments: any;
            shipments: any;
        } | null)[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
