# Return & Refund Boundaries (Phase M9 & M7 Integration)

## 1. Return (RMA) Workflow
1. **Eligibility:**
   - Only orders with status `DELIVERED` (or where all shipments are `DELIVERED`) are eligible for return requests.
   - Customers submit reason (`DEFECTIVE`, `WRONG_ITEM`, `NOT_AS_DESCRIBED`, etc.) and descriptive notes.
2. **Transition:**
   - Order transitions to `RETURN_REQUESTED`.
3. **Staff Review (`/api/v1/admin/orders/:id/return-action`):**
   - **APPROVE:** Transitions order to `RETURNED`. Item inspection notes recorded.
   - **REJECT:** Transitions order back to `DELIVERED`. Rejection reason recorded in `OrderStatusHistory`.

## 2. Refund Boundary Architecture
- **Boundary Isolation:** Order management (`Order.status`) operates strictly as an operational lifecycle coordinator.
- **Financial Settlement Authority:** Actual monetary refunds (credit card reversal, PromptPay refund, bank wire) belong exclusively to the **M7 Payment Gateway Domain**.
- **No Synthetic Refunds:** Approving a return or cancelling a paid order creates refund eligibility metadata and logs; actual monetary movement requires explicit invocation of `PaymentService.refundPayment()`.
