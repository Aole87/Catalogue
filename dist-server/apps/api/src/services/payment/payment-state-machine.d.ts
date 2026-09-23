import { PaymentStatus, OrderStatus } from '@prisma/client';
export interface StateTransitionResult {
    allowed: boolean;
    targetPaymentStatus: PaymentStatus;
    targetOrderStatus?: OrderStatus;
    reason?: string;
}
export declare class PaymentStateMachine {
    private static readonly allowedTransitions;
    /**
     * Validates whether a state transition from `fromStatus` to `toStatus` is permitted.
     */
    static validateTransition(fromStatus: PaymentStatus, toStatus: PaymentStatus): void;
    /**
     * Resolves the corresponding OrderStatus for a PaymentStatus transition.
     */
    static resolveOrderStatus(paymentStatus: PaymentStatus): OrderStatus | null;
}
