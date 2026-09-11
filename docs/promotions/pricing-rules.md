# Promotion Engine & Pricing Calculation Rules

## 1. Server-Authoritative Pricing Rule
Client browsers and mobile applications cannot determine final discounts, promotional qualification, coupon validity, or order totals. All calculations are executed server-side within `PricingService` and `PromotionService`.

## 2. Promotion Types & Calculation
- **`PERCENTAGE`**: Calculates discount as `eligibleSubtotal * (discountValue / 100)`. If `maximumDiscountAmount` is defined, the discount is capped at `min(discount, maximumDiscountAmount)`.
- **`FIXED_AMOUNT`**: Calculates discount as `min(discountValue, eligibleSubtotal)`.

## 3. Scoping Matrix
- **Product Scope (`PromotionProduct`)**: Discount applies only to specified product UUIDs.
- **Category Scope (`PromotionCategory`)**: Discount applies to line items within specified categories.
- **Brand Scope (`PromotionBrand`)**: Discount applies to line items belonging to specified brands.
- **Unscoped**: Applies across the entire order subtotal if minimum order criteria are met.

## 4. Minimum Order Threshold
Promotions declare `minimumOrderAmount Decimal @default(0.00)`. Orders with `subtotal < minimumOrderAmount` are rejected with clear explanation.

## 5. Promotion Stacking Policy
Only one primary coupon or promotion is permitted per order unless explicitly declared with `stackable: true`. If a non-stackable coupon is applied, secondary coupons cannot be combined.
