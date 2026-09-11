# Order Cancellation Policy

## 1. Customer Cancellation Policy
Customers are permitted to cancel orders self-service under the following rules:

1. **Permitted Statuses:**
   - `PENDING_PAYMENT` (Unpaid orders)
   - `PAYMENT_CONFIRMED` (Paid orders awaiting fulfillment)
   - `PROCESSING` (Provided carrier has not picked up parcel)

2. **Strict Disallow Rules:**
   - If any associated shipment has reached `SHIPPED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, or `DELIVERED`, customer cancellation is rejected.
   - The customer is advised to wait for delivery and initiate an RMA return request.

3. **Financial Refund Handling on Cancellation:**
   - Cancelling a `PAYMENT_CONFIRMED` order transitions `Order.status` to `CANCELLED`.
   - `OrderStatusHistory.note` is updated to flag refund eligibility: `Paid order cancelled — marked eligible for refund under M7 Payment authority`.
   - **Crucial Separation:** The financial payment record remains in status `PAID` until processed by accounting/finance through M7 Payment Service (`PaymentService.refundPayment`). The system does not create synthetic refunds.

## 2. Staff / Admin Cancellation Policy
- Staff may cancel orders in any pre-delivery state (`PENDING_PAYMENT`, `PAYMENT_CONFIRMED`, `PROCESSING`, `READY_FOR_SHIPMENT`, `SHIPPED`).
- Staff cancellation mandates a reason string (`reason`) for audit compliance.
- Staff cannot cancel orders already marked `DELIVERED` (must use Return workflow).
