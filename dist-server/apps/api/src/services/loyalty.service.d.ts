import { Prisma } from '@prisma/client';
export declare class LoyaltyService {
    static readonly POINTS_PER_THB_EARNED = 0.01;
    static readonly THB_PER_POINT_REDEEMED = 0.1;
    /**
     * Calculates points earned from an order amount.
     */
    static calculatePointsEarned(grandTotal: number): number;
    /**
     * Calculates monetary discount from points to redeem.
     */
    static calculatePointsDiscount(points: number): number;
    /**
     * Validates if customer has sufficient points to redeem and computes discount value.
     */
    static validateRedemption(customerId: string, points: number, subtotal?: number): Promise<{
        isValid: boolean;
        pointsToRedeem: number;
        discountAmount: number;
        currentBalance: number;
        balanceAfter: number;
    }>;
    /**
     * Order-linked earning upon PAYMENT_CONFIRMED.
     * Safe against duplicate events.
     */
    static awardPointsForOrder(customerId: string, orderId: string, grandTotal: number, orderNumber: string): Promise<{
        account: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        };
    } | null>;
    /**
     * Deducts points during checkout within transaction.
     */
    static redeemPointsForOrderTx(customerId: string, orderId: string, points: number, orderNumber: string, tx: Prisma.TransactionClient): Promise<{
        account: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        };
    } | null>;
    /**
     * Reverses points on refund/cancellation by creating compensating transactions.
     */
    static handleOrderRefund(customerId: string, orderId: string, orderNumber: string, pointsRedeemed: number, pointsEarned: number): Promise<void>;
    /**
     * Staff manual adjustment with mandatory reason and actor.
     */
    static adjustPoints(customerId: string, points: number, reason: string, actorUserId: string, referenceId?: string | null): Promise<{
        account: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        };
    }>;
}
