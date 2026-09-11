# Coupon Concurrency Strategy & Usage Limit Protection

## 1. Concurrency Risks
In flash sales and limited-time marketing events, race conditions occur when multiple requests attempt to redeem the final available coupon code simultaneously. Naive `SELECT count ... UPDATE count` patterns lead to over-redemption.

## 2. Concurrency Safety Model
1. **ACID Transaction Isolation**: Redemptions execute within `prisma.$transaction`.
2. **Row-Level Usage Lock**:
   - Atomic update checks:
     ```ts
     const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
     if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
       throw new BadRequestException('Coupon usage limit reached');
     }
     await tx.coupon.update({
       where: { id: couponId },
       data: { usageCount: { increment: 1 } },
     });
     ```
3. **Per-Customer Redemption Limits**:
   - `CouponRedemption` counts are verified within the transaction:
     ```ts
     const customerRedemptions = await tx.couponRedemption.count({
       where: { couponId, customerId },
     });
     if (customerRedemptions >= perLimit) {
       throw new BadRequestException('Per-customer redemption limit reached');
     }
     ```
4. **Unique Identity Constraints**:
   - `@@unique([couponId, orderId])` prevents accidental duplicate redemption on order retries.

## 3. Historical Order Immutability
When an order is created, the promotion and coupon metadata (`couponCode`, `promotionId`, `discountAmount`) are snapshotted into `Order` and `CouponRedemption`. Changing or deleting a promotion later NEVER recalculates historical orders.
