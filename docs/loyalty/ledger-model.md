# Append-Only Loyalty Points Ledger & Reversal Model

## 1. Core Principles
- **Append-Only Ledger**: `LoyaltyTransaction` records are strictly append-only. Historical transactions are never mutated or soft-deleted.
- **Current Balance Invariant**: `pointsBalance >= 0`. Transactions attempting to debit more than available points throw immediate validation errors.
- **ACID Balance Updates**: Balance adjustments execute within `prisma.$transaction` under `Serializable` transaction isolation.

## 2. Transaction Types
- **`EARN`**: Points awarded upon reaching `PAYMENT_CONFIRMED` (1 point per 100 THB spent).
- **`REDEEM`**: Points deducted during checkout (10 points = 1 THB discount).
- **`ADJUST`**: Staff manual credit/debit with mandatory reason and actor context.
- **`EXPIRE`**: Expired points deduction based on program policy.
- **`REFUND_REVERSAL`**: Compensating debit transaction when a points-earning order is cancelled or refunded.

## 3. Order-Linked Earning Lifecycle
Points are linked to order payment confirmation. Duplicate payment notifications or webhook retries check `hasOrderEarnedPoints(orderId)` to guarantee exactly one earning transaction per order.

## 4. Refund / Return Handling
When an order is cancelled or refunded:
1. Points redeemed by the customer are refunded via an `ADJUST` transaction.
2. Points earned by the order are revoked via a `REFUND_REVERSAL` transaction.
3. Historical `EARN` and `REDEEM` records remain unchanged for accounting auditability.
