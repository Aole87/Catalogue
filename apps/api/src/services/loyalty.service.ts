import { LoyaltyRepository } from '../repositories/loyalty.repository';
import { LoyaltyTransactionType, Prisma } from '@prisma/client';
import { prisma } from '@car-parts/database';
import { BadRequestException, NotFoundException } from '../errors/app-error';

export class LoyaltyService {
  public static readonly POINTS_PER_THB_EARNED = 0.01; // 1 point per 100 THB spent (100 THB -> 1 point)
  public static readonly THB_PER_POINT_REDEEMED = 0.10; // 10 points = 1 THB (100 points = 10 THB)

  /**
   * Calculates points earned from an order amount.
   */
  static calculatePointsEarned(grandTotal: number): number {
    return Math.floor(grandTotal * this.POINTS_PER_THB_EARNED);
  }

  /**
   * Calculates monetary discount from points to redeem.
   */
  static calculatePointsDiscount(points: number): number {
    const discount = points * this.THB_PER_POINT_REDEEMED;
    return Number(discount.toFixed(2));
  }

  /**
   * Validates if customer has sufficient points to redeem and computes discount value.
   */
  static async validateRedemption(customerId: string, points: number, subtotal?: number) {
    if (points <= 0) {
      throw new BadRequestException('Points to redeem must be greater than 0');
    }

    const account = await LoyaltyRepository.getOrCreateAccount(customerId);
    if (account.pointsBalance < points) {
      throw new BadRequestException(
        `Insufficient points. Available balance: ${account.pointsBalance}, requested: ${points}`
      );
    }

    const discountAmount = this.calculatePointsDiscount(points);
    if (subtotal !== undefined && discountAmount > subtotal) {
      throw new BadRequestException(
        `Points discount (฿${discountAmount.toFixed(2)}) cannot exceed order subtotal (฿${subtotal.toFixed(2)})`
      );
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
  static async awardPointsForOrder(
    customerId: string,
    orderId: string,
    grandTotal: number,
    orderNumber: string
  ) {
    const alreadyEarned = await LoyaltyRepository.hasOrderEarnedPoints(orderId);
    if (alreadyEarned) {
      return null; // Idempotent: prevent duplicate award
    }

    const points = this.calculatePointsEarned(grandTotal);
    if (points <= 0) return null;

    const tx = await LoyaltyRepository.recordTransaction(customerId, {
      transactionType: LoyaltyTransactionType.EARN,
      points,
      orderId,
      referenceId: orderNumber,
      reason: `Points earned from Order ${orderNumber} (฿${grandTotal.toFixed(2)})`,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { loyaltyPointsEarned: points },
    }).catch(() => {});

    return tx;
  }

  /**
   * Deducts points during checkout within transaction.
   */
  static async redeemPointsForOrderTx(
    customerId: string,
    orderId: string,
    points: number,
    orderNumber: string,
    tx: Prisma.TransactionClient
  ) {
    if (points <= 0) return null;

    return LoyaltyRepository.recordTransaction(
      customerId,
      {
        transactionType: LoyaltyTransactionType.REDEEM,
        points: -points, // Negative for deduction
        orderId,
        referenceId: orderNumber,
        reason: `Points redeemed for Order ${orderNumber}`,
      },
      tx
    );
  }

  /**
   * Reverses points on refund/cancellation by creating compensating transactions.
   */
  static async handleOrderRefund(
    customerId: string,
    orderId: string,
    orderNumber: string,
    pointsRedeemed: number,
    pointsEarned: number
  ) {
    // If customer redeemed points on this order, restore them
    if (pointsRedeemed > 0) {
      await LoyaltyRepository.recordTransaction(customerId, {
        transactionType: LoyaltyTransactionType.ADJUST,
        points: pointsRedeemed,
        orderId,
        referenceId: `REFUND-RESTORE-${orderNumber}`,
        reason: `Restoration of ${pointsRedeemed} points from refunded Order ${orderNumber}`,
      });
    }

    // If pointsEarned was not supplied, lookup EARN transaction for this order
    let earnedToReverse = pointsEarned;
    if (earnedToReverse <= 0) {
      const earnedTx = await prisma.loyaltyTransaction.findFirst({
        where: { orderId, transactionType: LoyaltyTransactionType.EARN },
      });
      if (earnedTx) {
        earnedToReverse = earnedTx.points;
      }
    }

    // If customer earned points on this order, reverse them
    if (earnedToReverse > 0) {
      await LoyaltyRepository.recordTransaction(customerId, {
        transactionType: LoyaltyTransactionType.REFUND_REVERSAL,
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
  static async adjustPoints(
    customerId: string,
    points: number,
    reason: string,
    actorUserId: string,
    referenceId?: string | null
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Reason is required for manual loyalty balance adjustments');
    }

    return LoyaltyRepository.recordTransaction(customerId, {
      transactionType: LoyaltyTransactionType.ADJUST,
      points,
      reason: reason.trim(),
      referenceId: referenceId || null,
      createdByUserId: actorUserId,
    });
  }
}
