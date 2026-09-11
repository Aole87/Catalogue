# Payment Provider Integration & Abstraction (Phase M7)

## 1. Provider Abstraction Interface

Payment provider adapters implement the uniform `PaymentProvider` interface:

```typescript
export interface PaymentProvider {
  readonly name: string;
  createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult>;
  verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult>;
  handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult>;
  refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult>;
}
```

---

## 2. Supported Payment Methods

### A. PromptPay (Thai QR Payment)
- **Status:** **REAL** (Standard EMVCo Thai QR payload generation & CRC-16 computation).
- **Format:** Dynamic EMVCo specification with Biller/Tax ID `0105558099881`, Currency `764` (THB), exact amount, and reference label.
- **Checksum:** Polynomial CRC-16 (`0x1021`, initial `0xFFFF`).
- **Settlement:** Automated incoming webhook with HMAC-SHA256 signature verification.

### B. Bank Transfer (Slip Upload Workflow)
- **Status:** **REAL** (Multi-bank instructions + Staff review workflow).
- **Workflow:**
  1. Customer places order and receives bank details (KBANK, SCB, BBL).
  2. Customer uploads slip details (`POST /api/v1/payments/:id/slip`) $\longrightarrow$ status `PENDING_REVIEW`.
  3. Staff with `payment.verify` reviews slip (`POST /api/v1/payments/slips/:slipId/verify`).
  4. System validates transfer amount against order grand total.
  5. Payment transitions to `PAID` and Order transitions to `PAYMENT_CONFIRMED`.

### C. Test Adapter
- **Status:** **TEST-ONLY** (Isolated deterministic provider for automated integration tests).
- **Capabilities:** HMAC signature generator helper, simulated timestamp expiration, out-of-order event simulation.
