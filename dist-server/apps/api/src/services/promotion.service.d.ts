import { Prisma } from '@prisma/client';
export interface PromotionLineItem {
    productId: string;
    sku?: string;
    categoryId?: string | null;
    brandId?: string | null;
    quantity: number;
    lineTotal: number | string;
}
export interface PromotionEvaluationResult {
    isEligible: boolean;
    rejectionReason?: string;
    discountAmount: number;
    eligibleSubtotal: number;
    appliedPromotion?: any;
    appliedCoupon?: any;
}
export declare class PromotionService {
    /**
     * Server-authoritative promotion and coupon eligibility evaluation.
     */
    static evaluatePromotion(promotion: any, items: PromotionLineItem[], subtotal: number, customerId?: string | null, customerRedemptionCount?: number): PromotionEvaluationResult;
    /**
     * Authoritative coupon validation.
     */
    static validateCoupon(code: string, items?: PromotionLineItem[], subtotal?: number, customerId?: string | null): Promise<{
        isValid: boolean;
        isEligible: boolean;
        coupon: {
            id: string;
            code: string;
            promotionId: string;
        };
        promotion: {
            id: string;
            name: string;
            promotionType: import(".prisma/client").$Enums.PromotionType;
            discountValue: number;
            maximumDiscountAmount: number | null;
        };
        discountAmount: number;
        eligibleSubtotal: number;
    }>;
    /**
     * Concurrency-safe atomic redemption of a coupon during checkout transaction.
     */
    static redeemCouponTx(couponId: string, orderId: string, customerId: string | null, discountAmount: number, tx: Prisma.TransactionClient): Promise<{
        id: string;
        orderId: string;
        customerId: string | null;
        promotionId: string | null;
        couponId: string;
        discountAmount: Prisma.Decimal;
        redeemedAt: Date;
    }>;
}
