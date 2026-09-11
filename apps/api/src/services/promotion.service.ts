import { prisma } from '@car-parts/database';
import { PromotionRepository } from '../repositories/promotion.repository';
import { Promotion, Coupon, PromotionStatus, PromotionType, Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '../errors/app-error';

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

export class PromotionService {
  /**
   * Server-authoritative promotion and coupon eligibility evaluation.
   */
  static evaluatePromotion(
    promotion: any,
    items: PromotionLineItem[],
    subtotal: number,
    customerId?: string | null,
    customerRedemptionCount = 0
  ): PromotionEvaluationResult {
    const now = new Date();

    // 1. Status Check
    if (promotion.status !== PromotionStatus.ACTIVE || promotion.deletedAt) {
      return {
        isEligible: false,
        rejectionReason: `Promotion is not active (current status: ${promotion.status})`,
        discountAmount: 0,
        eligibleSubtotal: 0,
      };
    }

    // 2. Date Window Check
    if (promotion.startsAt && new Date(promotion.startsAt) > now) {
      return {
        isEligible: false,
        rejectionReason: 'Promotion has not started yet',
        discountAmount: 0,
        eligibleSubtotal: 0,
      };
    }

    if (promotion.endsAt && new Date(promotion.endsAt) < now) {
      return {
        isEligible: false,
        rejectionReason: 'Promotion has expired',
        discountAmount: 0,
        eligibleSubtotal: 0,
      };
    }

    // 3. Global Usage Limit
    if (promotion.usageLimit !== null && promotion.usageLimit !== undefined) {
      if (promotion.usageCount >= promotion.usageLimit) {
        return {
          isEligible: false,
          rejectionReason: 'Promotion global usage limit has been reached',
          discountAmount: 0,
          eligibleSubtotal: 0,
        };
      }
    }

    // 4. Per Customer Usage Limit
    if (promotion.perCustomerLimit !== null && promotion.perCustomerLimit !== undefined) {
      if (customerRedemptionCount >= promotion.perCustomerLimit) {
        return {
          isEligible: false,
          rejectionReason: `You have reached the maximum redemption limit (${promotion.perCustomerLimit}) for this promotion`,
          discountAmount: 0,
          eligibleSubtotal: 0,
        };
      }
    }

    // 5. Minimum Order Amount Threshold
    const minOrder = Number(promotion.minimumOrderAmount || 0);
    if (subtotal < minOrder) {
      return {
        isEligible: false,
        rejectionReason: `Minimum order amount of ฿${minOrder.toFixed(2)} required (current subtotal: ฿${subtotal.toFixed(2)})`,
        discountAmount: 0,
        eligibleSubtotal: 0,
      };
    }

    // 6. Product / Category / Brand Scoping
    const scopedProductIds = new Set((promotion.products || []).map((p: any) => p.productId || p.id));
    const scopedCategoryIds = new Set((promotion.categories || []).map((c: any) => c.categoryId || c.id));
    const scopedBrandIds = new Set((promotion.brands || []).map((b: any) => b.brandId || b.id));

    const hasProductScope = scopedProductIds.size > 0;
    const hasCategoryScope = scopedCategoryIds.size > 0;
    const hasBrandScope = scopedBrandIds.size > 0;
    const isScoped = hasProductScope || hasCategoryScope || hasBrandScope;

    let eligibleSubtotal = 0;

    if (!isScoped) {
      eligibleSubtotal = subtotal;
    } else {
      for (const item of items) {
        let itemEligible = false;
        if (hasProductScope && scopedProductIds.has(item.productId)) itemEligible = true;
        if (hasCategoryScope && item.categoryId && scopedCategoryIds.has(item.categoryId)) itemEligible = true;
        if (hasBrandScope && item.brandId && scopedBrandIds.has(item.brandId)) itemEligible = true;

        if (itemEligible) {
          eligibleSubtotal += Number(item.lineTotal);
        }
      }

      if (eligibleSubtotal <= 0) {
        return {
          isEligible: false,
          rejectionReason: 'No items in the cart qualify for this scoped promotion',
          discountAmount: 0,
          eligibleSubtotal: 0,
        };
      }
    }

    // 7. Discount Calculation
    let calculatedDiscount = 0;
    const discountVal = Number(promotion.discountValue);

    if (promotion.promotionType === PromotionType.PERCENTAGE) {
      calculatedDiscount = (eligibleSubtotal * discountVal) / 100;
      if (promotion.maximumDiscountAmount !== null && promotion.maximumDiscountAmount !== undefined) {
        const maxCap = Number(promotion.maximumDiscountAmount);
        if (maxCap > 0 && calculatedDiscount > maxCap) {
          calculatedDiscount = maxCap;
        }
      }
    } else if (promotion.promotionType === PromotionType.FIXED_AMOUNT) {
      calculatedDiscount = Math.min(discountVal, eligibleSubtotal);
    }

    calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, subtotal));

    return {
      isEligible: true,
      discountAmount: Number(calculatedDiscount.toFixed(2)),
      eligibleSubtotal: Number(eligibleSubtotal.toFixed(2)),
      appliedPromotion: promotion,
    };
  }

  /**
   * Authoritative coupon validation.
   */
  static async validateCoupon(
    code: string,
    items: PromotionLineItem[] = [],
    subtotal?: number,
    customerId?: string | null
  ) {
    const coupon = await PromotionRepository.findCouponByCode(code);
    if (!coupon) {
      throw new NotFoundException(`Coupon code '${code}' not found or invalid`);
    }

    if (!coupon.isActive || coupon.deletedAt) {
      throw new BadRequestException(`Coupon code '${code}' is no longer active`);
    }

    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      throw new BadRequestException(`Coupon code '${code}' is not yet valid`);
    }

    if (coupon.endsAt && new Date(coupon.endsAt) < now) {
      throw new BadRequestException(`Coupon code '${code}' has expired`);
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException(`Coupon code '${code}' has reached its maximum usage limit`);
    }

    let customerRedemptionCount = 0;
    if (customerId) {
      customerRedemptionCount = await PromotionRepository.countCustomerCouponRedemptions(
        coupon.id,
        customerId
      );

      const perCustLimit = coupon.perCustomerLimit ?? coupon.promotion.perCustomerLimit;
      if (perCustLimit !== null && perCustLimit !== undefined && customerRedemptionCount >= perCustLimit) {
        throw new BadRequestException(
          `You have reached the maximum redemption limit (${perCustLimit}) for this coupon`
        );
      }
    }

    const computedSubtotal =
      subtotal !== undefined
        ? subtotal
        : items.reduce((sum, item) => sum + Number(item.lineTotal), 0);

    const evaluation = this.evaluatePromotion(
      coupon.promotion,
      items,
      computedSubtotal,
      customerId,
      customerRedemptionCount
    );

    if (!evaluation.isEligible) {
      throw new BadRequestException(evaluation.rejectionReason || 'Coupon is not eligible for this order');
    }

    return {
      isValid: true,
      isEligible: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        promotionId: coupon.promotionId,
      },
      promotion: {
        id: coupon.promotion.id,
        name: coupon.promotion.name,
        promotionType: coupon.promotion.promotionType,
        discountValue: Number(coupon.promotion.discountValue),
        maximumDiscountAmount: coupon.promotion.maximumDiscountAmount
          ? Number(coupon.promotion.maximumDiscountAmount)
          : null,
      },
      discountAmount: evaluation.discountAmount,
      eligibleSubtotal: evaluation.eligibleSubtotal,
    };
  }

  /**
   * Concurrency-safe atomic redemption of a coupon during checkout transaction.
   */
  static async redeemCouponTx(
    couponId: string,
    orderId: string,
    customerId: string | null,
    discountAmount: number,
    tx: Prisma.TransactionClient
  ) {
    // 1. Lock coupon row atomically using PostgreSQL pessimistic lock
    const lockedCoupons: any[] = await tx.$queryRaw`
      SELECT id, "promotion_id" AS "promotionId", "usage_limit" AS "usageLimit", "usage_count" AS "usageCount", "is_active" AS "isActive", "per_customer_limit" AS "perCustomerLimit"
      FROM "coupons"
      WHERE "id" = ${couponId}::uuid AND "deleted_at" IS NULL
      FOR UPDATE
    `;

    if (!lockedCoupons || lockedCoupons.length === 0) {
      throw new BadRequestException('Coupon is invalid or inactive');
    }

    const coupon = lockedCoupons[0];
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is invalid or inactive');
    }

    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (customerId) {
      const perLimit = coupon.perCustomerLimit;
      if (perLimit !== null && perLimit !== undefined) {
        const customerRedemptions = await tx.couponRedemption.count({
          where: { couponId, customerId },
        });
        if (customerRedemptions >= perLimit) {
          throw new BadRequestException('Per-customer redemption limit reached');
        }
      }
    }

    // Increment coupon usage count
    await tx.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    });

    // Increment promotion usage count
    await tx.promotion.update({
      where: { id: coupon.promotionId },
      data: { usageCount: { increment: 1 } },
    });

    // Record redemption ledger entry
    const redemption = await tx.couponRedemption.create({
      data: {
        couponId,
        promotionId: coupon.promotionId,
        orderId,
        customerId: customerId || null,
        discountAmount: new Prisma.Decimal(discountAmount),
      },
    });

    return redemption;
  }
}
