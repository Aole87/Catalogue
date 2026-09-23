import { Prisma } from '@prisma/client';
export interface CreatePaymentParams {
    orderId: string;
    provider: string;
    method: string;
    amount: string;
    currency: string;
    internalReference: string;
    idempotencyKey?: string | null;
    providerReference?: string | null;
    metadata?: any;
    actorId?: string | null;
}
export interface SettlePaymentParams {
    paymentId: string;
    providerReference?: string;
    providerTransactionId?: string;
    actorId?: string | null;
    reason?: string;
    gatewayResponse?: any;
}
export interface SubmitSlipParams {
    paymentId: string;
    slipUrl: string;
    bankName?: string;
    transferAmount?: string;
    transferredAt?: Date;
    notes?: string;
    actorId?: string | null;
}
export interface VerifySlipParams {
    slipId: string;
    verifiedByUserId: string;
    verifiedAmount?: string;
    note?: string;
}
export interface RejectSlipParams {
    slipId: string;
    verifiedByUserId: string;
    rejectionReason: string;
}
export interface CreateRefundParams {
    paymentId: string;
    refundReference: string;
    amount: string;
    currency: string;
    reason: string;
    actorId?: string | null;
}
export declare class PaymentRepository {
    private static paymentIncludes;
    /**
     * Atomically creates a Payment record and its initial PaymentEvent.
     */
    static createPayment(params: CreatePaymentParams): Promise<{
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
    }) | null>;
    static findByInternalReference(internalReference: string): Promise<({
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
    }) | null>;
    static findByProviderReference(providerReference: string): Promise<({
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
    })[]>;
    /**
     * Atomically settles a payment:
     * 1. Validates current payment status.
     * 2. Moves Payment -> PAID.
     * 3. Moves Order -> PAYMENT_CONFIRMED.
     * 4. Logs OrderStatusHistory and PaymentEvent.
     */
    static settlePayment(params: SettlePaymentParams): Promise<({
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
    }) | null>;
    /**
     * Customer submits a bank transfer slip.
     */
    static submitSlip(params: SubmitSlipParams): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentId: string;
        slipUrl: string;
        bankName: string | null;
        transferAmount: Prisma.Decimal | null;
        transferredAt: Date | null;
        notes: string | null;
        status: string;
        verifiedByUserId: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
    }>;
    /**
     * Staff verifies bank transfer slip and settles payment atomically.
     */
    static verifySlip(params: VerifySlipParams): Promise<({
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
        events: {
            id: string;
            createdAt: Date;
            fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
            toStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentId: string;
            eventType: string;
            reason: string | null;
            payload: Prisma.JsonValue | null;
            actorId: string | null;
        }[];
        transactions: {
            id: string;
            createdAt: Date;
            paymentId: string;
            status: string;
            currency: string;
            transactionType: string;
            amount: Prisma.Decimal;
            providerTransactionId: string | null;
            gatewayResponse: Prisma.JsonValue | null;
        }[];
        refunds: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        }[];
        slips: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            slipUrl: string;
            bankName: string | null;
            transferAmount: Prisma.Decimal | null;
            transferredAt: Date | null;
            notes: string | null;
            status: string;
            verifiedByUserId: string | null;
            verifiedAt: Date | null;
            rejectionReason: string | null;
        }[];
    } & {
        method: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        metadata: Prisma.JsonValue | null;
        currency: string;
        idempotencyKey: string | null;
        internalReference: string;
        provider: string;
        amount: Prisma.Decimal;
        providerReference: string | null;
        paidAt: Date | null;
    }) | null>;
    /**
     * Staff rejects bank transfer slip.
     */
    static rejectSlip(params: RejectSlipParams): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        paymentId: string;
        slipUrl: string;
        bankName: string | null;
        transferAmount: Prisma.Decimal | null;
        transferredAt: Date | null;
        notes: string | null;
        status: string;
        verifiedByUserId: string | null;
        verifiedAt: Date | null;
        rejectionReason: string | null;
    }>;
    /**
     * Idempotently records a webhook event.
     * If already processed or received (including during concurrent race conditions), returns isDuplicate: true.
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
     * Processes a refund:
     * Validates cumulative refund <= paid amount and updates state.
     */
    static refundPayment(params: CreateRefundParams): Promise<{
        refund: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            paymentId: string;
            status: string;
            reason: string;
            currency: string;
            amount: Prisma.Decimal;
            refundReference: string;
        };
        payment: ({
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
            events: {
                id: string;
                createdAt: Date;
                fromStatus: import(".prisma/client").$Enums.PaymentStatus | null;
                toStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentId: string;
                eventType: string;
                reason: string | null;
                payload: Prisma.JsonValue | null;
                actorId: string | null;
            }[];
            transactions: {
                id: string;
                createdAt: Date;
                paymentId: string;
                status: string;
                currency: string;
                transactionType: string;
                amount: Prisma.Decimal;
                providerTransactionId: string | null;
                gatewayResponse: Prisma.JsonValue | null;
            }[];
            refunds: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                status: string;
                reason: string;
                currency: string;
                amount: Prisma.Decimal;
                refundReference: string;
            }[];
            slips: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                paymentId: string;
                slipUrl: string;
                bankName: string | null;
                transferAmount: Prisma.Decimal | null;
                transferredAt: Date | null;
                notes: string | null;
                status: string;
                verifiedByUserId: string | null;
                verifiedAt: Date | null;
                rejectionReason: string | null;
            }[];
        } & {
            method: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: Prisma.JsonValue | null;
            currency: string;
            idempotencyKey: string | null;
            internalReference: string;
            provider: string;
            amount: Prisma.Decimal;
            providerReference: string | null;
            paidAt: Date | null;
        }) | null;
    }>;
}
