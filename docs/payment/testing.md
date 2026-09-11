# Payment Domain Automated Testing Guide (Phase M7)

## 1. Test Suite Overview (`scripts/m7-test.ts`)
The M7 test suite verifies all financial invariants, state machine transitions, webhook security, and race conditions across 25 deterministic automated test cases.

```bash
npm run m7:test
```

---

## 2. Test Coverage Matrix

| Test Case | Description | Target Component |
| :--- | :--- | :--- |
| **Server Financial Authority** | Rejects client-tampered amounts and currencies | `PaymentService.createPayment` |
| **Legal Transitions** | Verifies `PENDING` $\to$ `PAID` $\to$ `REFUNDED` | `PaymentStateMachine` |
| **Illegal Transitions** | Rejects `FAILED` $\to$ `PAID`, `REFUNDED` $\to$ `PAID` | `PaymentStateMachine` |
| **Invalid Signature** | Rejects forged HMAC-SHA256 signatures with 400 | `PaymentService.handleWebhook` |
| **Replay Protection** | Rejects webhook timestamps older than 300 seconds | `PaymentService.handleWebhook` |
| **Authoritative Settlement** | Valid webhook transitions Payment to `PAID` & Order to `PAYMENT_CONFIRMED` | `PaymentRepository.settlePayment` |
| **Webhook Idempotency** | Duplicate event IDs return `ALREADY_PROCESSED` without side effects | `WebhookEvent` |
| **Underpayment Rejection** | Rejects webhooks reporting amounts lower than order total | `PaymentService.handleWebhook` |
| **Currency Mismatch** | Rejects non-THB currency webhooks | `PaymentService.handleWebhook` |
| **PromptPay EMVCo Spec** | Validates tag structure and CRC-16 polynomial checksum | `PromptPayProvider` |
| **Bank Slip Submission** | Customer slip submission sets status `PENDING_REVIEW` | `PaymentRepository.submitSlip` |
| **Non-Staff Verification** | Customer calling slip verify endpoint returns 403 Forbidden | `PaymentRoutes` RBAC |
| **Staff Verification** | Staff verifying slip moves Payment to `PAID` & Order to `CONFIRMED` | `PaymentRepository.verifySlip` |
| **Non-Staff Refund** | Non-staff refund request returns 403 Forbidden | `PaymentRoutes` RBAC |
| **Excessive Refund** | Rejects refund request exceeding captured total with 400 | `PaymentRepository.refundPayment` |
| **Partial & Full Refund** | Verifies `PARTIALLY_REFUNDED` and `REFUNDED` state transitions | `PaymentRepository.refundPayment` |
| **IDOR Protection** | Customer A cannot query Customer B's payment (403) | `PaymentService.verifyOrderOwnership` |
| **Concurrency Safety** | 5 simultaneous webhook calls settle payment exactly once | `prisma.$transaction` & Locks |
| **Hydrated Model Read** | GET `/api/v1/payments/:id` returns formatted model with relations | `PaymentController.getPaymentById` |
| **Order Payment Query** | GET `/api/v1/orders/:orderId/payment` returns payment | `PaymentController.getPaymentByOrderId` |
| **Slip Rejection** | Staff rejecting slip sets status `REJECTED` and reason | `PaymentRepository.rejectSlip` |
| **Pending Refund Rejection** | Attempting to refund an unpaid order returns 400 | `PaymentService.refundPayment` |
| **Audit Trail Verification** | Validates `AuditLog` and `PaymentEvent` entries | `AuditRepository` |
| **Payment Creation Idempotency** | Same `idempotencyKey` returns identical payment record | `PaymentRepository.createPayment` |
| **Corrupted CRC Rejection** | Verifies CRC algorithm detects payload byte corruption | `PromptPayProvider` |
