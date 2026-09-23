"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const loyalty_repository_1 = require("../repositories/loyalty.repository");
const client_1 = require("@prisma/client");
const database_1 = require("@car-parts/database");
const app_error_1 = require("../errors/app-error");
class LoyaltyService {
    static POINTS_PER_THB_EARNED = 0.01; // 1 point per 100 THB spent (100 THB -> 1 point)
    static THB_PER_POINT_REDEEMED = 0.10; // 10 points = 1 THB (100 points = 10 THB)
    /**
     * Calculates points earned from an order amount.
     */
    static calculatePointsEarned(grandTotal) {
        return Math.floor(grandTotal * this.POINTS_PER_THB_EARNED);
    }
    /**
     * Calculates monetary discount from points to redeem.
     */
    static calculatePointsDiscount(points) {
        const discount = points * this.THB_PER_POINT_REDEEMED;
        return Number(discount.toFixed(2));
    }
    /**
     * Validates if customer has sufficient points to redeem and computes discount value.
     */
    static async validateRedemption(customerId, points, subtotal) {
        if (points <= 0) {
            throw new app_error_1.BadRequestException('Points to redeem must be greater than 0');
        }
        const account = await loyalty_repository_1.LoyaltyRepository.getOrCreateAccount(customerId);
        if (account.pointsBalance < points) {
            throw new app_error_1.BadRequestException(`Insufficient points. Available balance: ${account.pointsBalance}, requested: ${points}`);
        }
        const discountAmount = this.calculatePointsDiscount(points);
        if (subtotal !== undefined && discountAmount > subtotal) {
            throw new app_error_1.BadRequestException(`Points discount (฿${discountAmount.toFixed(2)}) cannot exceed order subtotal (฿${subtotal.toFixed(2)})`);
        }
        return {
            isValid: true,
            pointsToRedeem: points,
            discountAmount,
            currentBalance: account.pointsBalance,
            balanceAfter: account.pointsBalance - points,
        };
    }
    /**
     * Order-linked earning upon PAYMENT_CONFIRMED.
     * Safe against duplicate events.
     */
    static async awardPointsForOrder(customerId, orderId, grandTotal, orderNumber) {
        const alreadyEarned = await loyalty_repository_1.LoyaltyRepository.hasOrderEarnedPoints(orderId);
        if (alreadyEarned) {
            return null; // Idempotent: prevent duplicate award
        }
        const points = this.calculatePointsEarned(grandTotal);
        if (points <= 0)
            return null;
        const tx = await loyalty_repository_1.LoyaltyRepository.recordTransaction(customerId, {
            transactionType: client_1.LoyaltyTransactionType.EARN,
            points,
            orderId,
            referenceId: orderNumber,
            reason: `Points earned from Order ${orderNumber} (฿${grandTotal.toFixed(2)})`,
        });
        await database_1.prisma.order.update({
            where: { id: orderId },
            data: { loyaltyPointsEarned: points },
        }).catch(() => { });
        return tx;
    }
    /**
     * Deducts points during checkout within transaction.
     */
    static async redeemPointsForOrderTx(customerId, orderId, points, orderNumber, tx) {
        if (points <= 0)
            return null;
        return loyalty_repository_1.LoyaltyRepository.recordTransaction(customerId, {
            transactionType: client_1.LoyaltyTransactionType.REDEEM,
            points: -points, // Negative for deduction
            orderId,
            referenceId: orderNumber,
            reason: `Points redeemed for Order ${orderNumber}`,
        }, tx);
    }
    /**
     * Reverses points on refund/cancellation by creating compensating transactions.
     */
    static async handleOrderRefund(customerId, orderId, orderNumber, pointsRedeemed, pointsEarned) {
        // If customer redeemed points on this order, restore them
        if (pointsRedeemed > 0) {
            await loyalty_repository_1.LoyaltyRepository.recordTransaction(customerId, {
                transactionType: client_1.LoyaltyTransactionType.ADJUST,
                points: pointsRedeemed,
                orderId,
                referenceId: `REFUND-RESTORE-${orderNumber}`,
                reason: `Restoration of ${pointsRedeemed} points from refunded Order ${orderNumber}`,
            });
        }
        // If pointsEarned was not supplied, lookup EARN transaction for this order
        let earnedToReverse = pointsEarned;
        if (earnedToReverse <= 0) {
            const earnedTx = await database_1.prisma.loyaltyTransaction.findFirst({
                where: { orderId, transactionType: client_1.LoyaltyTransactionType.EARN },
            });
            if (earnedTx) {
                earnedToReverse = earnedTx.points;
            }
        }
        // If customer earned points on this order, reverse them
        if (earnedToReverse > 0) {
            await loyalty_repository_1.LoyaltyRepository.recordTransaction(customerId, {
                transactionType: client_1.LoyaltyTransactionType.REFUND_REVERSAL,
                points: -earnedToReverse,
                orderId,
                referenceId: `REFUND-REVERSAL-${orderNumber}`,
                reason: `Reversal of ${earnedToReverse} points from refunded Order ${orderNumber}`,
            });
        }
    }
    /**
     * Staff manual adjustment with mandatory reason and actor.
     */
    static async adjustPoints(customerId, points, reason, actorUserId, referenceId) {
        if (!reason || reason.trim().length === 0) {
            throw new app_error_1.BadRequestException('Reason is required for manual loyalty balance adjustments');
        }
        return loyalty_repository_1.LoyaltyRepository.recordTransaction(customerId, {
            transactionType: client_1.LoyaltyTransactionType.ADJUST,
            points,
            reason: reason.trim(),
            referenceId: referenceId || null,
            createdByUserId: actorUserId,
        });
    }
}
exports.LoyaltyService = LoyaltyService;
//# sourceMappingURL=loyalty.service.js.map