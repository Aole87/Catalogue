# Refund Policy & Execution Guide (Phase M7)

## 1. Refund Invariants
- **Non-Exceeding Invariant:** $\sum \text{Refunds} \le \text{Captured Payment Amount}$.
- **Status Precondition:** Refunds can only be processed on payments with status `PAID` or `PARTIALLY_REFUNDED`. Attempting to refund `PENDING`, `FAILED`, or `CANCELLED` payments is rejected.
- **Granular Transitions:**
  - If $\sum \text{Refunds} < \text{Payment Amount}$, `Payment.status` moves to `PARTIALLY_REFUNDED` and `Order.status` remains `PAYMENT_CONFIRMED`.
  - If $\sum \text{Refunds} == \text{Payment Amount}$, `Payment.status` moves to `REFUNDED` and `Order.status` moves to `REFUNDED`.

---

## 2. Authorization & RBAC
Refunds are privileged administrative actions:
- Requires staff roles: `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`.
- Requires granular permission: `payment.refund`.
- Customers cannot trigger or self-issue refunds.

---

## 3. Financial Auditability
Every refund creates:
1. An immutable row in `payment_refunds` with unique `refundReference`.
2. A financial transaction row in `payment_transactions` typed as `REFUND`.
3. An audit record in `payment_events` capturing the actor, amount, and reason.
4. An `order_status_histories` entry if the parent order is transitioned.
