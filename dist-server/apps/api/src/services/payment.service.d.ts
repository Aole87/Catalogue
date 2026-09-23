export interface CreatePaymentInput {
    orderId: string;
    provider?: string;
    method?: string;
    idempotencyKey?: string;
    userId?: string;
}
export interface SubmitSlipInput {
    slipUrl: string;
    bankName?: string;
    transferAmount?: string;
    transferredAt?: Date;
    notes?: string;
}
export interface VerifySlipInput {
    verifiedAmount?: string;
    note?: string;
}
export interface RejectSlipInput {
    rejectionReason: string;
}
export interface RefundPaymentInput {
    amount: string;
    reason: string;
}
export declare class PaymentService {
    /**
     * Generates a unique, non-guessable internal payment reference.
     */
    private static generateInternalReference;
    /**
     * Formats payment data for client JSON responses.
     */
    static formatPaymentResponse(payment: any): {
        id: any;
        orderId: any;
        internalReference: any;
        idempotencyKey: any;
        provider: any;
        method: any;
        status: any;
        amount: string;
        currency: any;
        providerReference: any;
        metadata: any;
        paidAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        events: any;
        slips: any;
        refunds: any;
    } | null;
    /**
     * Authorizes that a user owns the order linked to a payment, or has staff/admin privileges.
     */
    private static verifyOrderOwnership;
    /**
     * Initiates payment for an order with server-authoritative amount and unique reference.
     */
    static createPayment(input: CreatePaymentInput): Promise<{
        qrPayload: string | undefined;
        bankDetails: {
            bankName: string;
            accountNumber: string;
            accountName: string;
            promptpayId?: string;
        } | undefined;
        paymentUrl: string | undefined;
        id?: any;
        orderId?: any;
        internalReference?: any;
        idempotencyKey?: any;
        provider?: any;
        method?: any;
        status?: any;
        amount?: string | undefined;
        currency?: any;
        providerReference?: any;
        metadata?: any;
        paidAt?: any;
        createdAt?: any;
        updatedAt?: any;
        order?: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        events?: any;
        slips?: any;
        refunds?: any;
    }>;
    /**
     * Retrieves payment by its UUID with IDOR authorization protection.
     */
    static getPaymentById(paymentId: string, userId?: string, userRoles?: string[]): Promise<{
        id: any;
        orderId: any;
        internalReference: any;
        idempotencyKey: any;
        provider: any;
        method: any;
        status: any;
        amount: string;
        currency: any;
        providerReference: any;
        metadata: any;
        paidAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        events: any;
        slips: any;
        refunds: any;
    } | null>;
    /**
     * Retrieves payment by order ID with IDOR protection.
     */
    static getPaymentByOrderId(orderId: string, userId?: string, userRoles?: string[]): Promise<{
        id: any;
        orderId: any;
        internalReference: any;
        idempotencyKey: any;
        provider: any;
        method: any;
        status: any;
        amount: string;
        currency: any;
        providerReference: any;
        metadata: any;
        paidAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        events: any;
        slips: any;
        refunds: any;
    } | null>;
    /**
     * Customer submits bank transfer slip.
     */
    static submitSlip(paymentId: string, input: SubmitSlipInput, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentId: string;
        slipUrl: string;
        bankName: string | null;
        transferAmount: import("@prisma/client/runtime/library").Decimal | null;
        transferredAt: Date | null;
        notes: string | null;
        status: string;
        verifiedByUserId: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
    }>;
    /**
     * Staff verifies bank transfer slip and moves Order to PAYMENT_CONFIRMED.
     */
    static verifySlip(slipId: string, input: VerifySlipInput, staffUserId: string): Promise<{
        id: any;
        orderId: any;
        internalReference: any;
        idempotencyKey: any;
        provider: any;
        method: any;
        status: any;
        amount: string;
        currency: any;
        providerReference: any;
        metadata: any;
        paidAt: any;
        createdAt: any;
        updatedAt: any;
        order: {
            id: any;
            orderNumber: any;
            status: any;
            grandTotal: string;
            currency: any;
        } | undefined;
        events: any;
        slips: any;
        refunds: any;
    } | null>;
    /**
     * Staff rejects bank transfer slip.
     */
    static rejectSlip(slipId: string, input: RejectSlipInput, staffUserId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentId: string;
        slipUrl: string;
        bankName: string | null;
        transferAmount: import("@prisma/client/runtime/library").Decimal | null;
        transferredAt: Date | null;
        notes: string | null;
        status: string;
        verifiedByUserId: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
    }>;
    /**
     * Authoritative inbound webhook handler with HMAC signature verification, replay protection, and idempotency.
     */
    static handleWebhook(providerName: string, rawBody: any, headers: Record<string, any>): Promise<{
        status: string;
        duplicate: boolean;
        eventId: string;
        paymentId?: undefined;
        orderStatus?: undefined;
    } | {
        status: string;
        paymentId: string | undefined;
        orderStatus: "PAYMENT_CONFIRMED";
        duplicate?: undefined;
        eventId?: undefined;
    } | {
        status: string;
        paymentId: string;
        duplicate?: undefined;
        eventId?: undefined;
        orderStatus?: undefined;
    }>;
    /**
     * Processes a refund for an existing settled payment.
     */
    static refundPayment(paymentId: string, input: RefundPaymentInput, staffUserId: string): Promise<{
        refund: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            refundReference: string;
        };
        payment: {
            id: any;
            orderId: any;
            internalReference: any;
            idempotencyKey: any;
            provider: any;
            method: any;
            status: any;
            amount: string;
            currency: any;
            providerReference: any;
            metadata: any;
            paidAt: any;
            createdAt: any;
            updatedAt: any;
            order: {
                id: any;
                orderNumber: any;
                status: any;
                grandTotal: string;
                currency: any;
            } | undefined;
            events: any;
            slips: any;
            refunds: any;
        } | null;
    }>;
}
