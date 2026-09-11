# Payment Lifecycle State Machine (Phase M7)

## 1. State Matrix

The Payment State Machine enforces explicit, unidirectional transitions across payment statuses.

```
       ┌───────────────┐
       │    PENDING    │
       └───────┬───────┘
               │
       ┌───────┴───────────────────────┐
       ▼                               ▼
┌──────────────┐               ┌──────────────┐
│     PAID     │               │    FAILED    │
└──────┬───────┘               └──────────────┘
       │
       ▼
┌──────────────┐
│   REFUNDED   │  (or PARTIALLY_REFUNDED)
└──────────────┘
```

| Current State | Allowed Next States | Trigger | Order Effect |
| :--- | :--- | :--- | :--- |
| `PENDING` | `PAID` | Verified Webhook / Staff Slip Verification | `PAYMENT_CONFIRMED` |
| `PENDING` | `FAILED` | Provider Payment Failure / Gateway Rejection | `PENDING_PAYMENT` (or `CANCELLED`) |
| `PENDING` | `CANCELLED` | Order cancellation before payment | `CANCELLED` |
| `PAID` | `PARTIALLY_REFUNDED` | Staff Partial Refund (`refund < paidAmount`) | Remains `PAYMENT_CONFIRMED` |
| `PAID` | `REFUNDED` | Staff Full Refund (`refund == paidAmount`) | `REFUNDED` |
| `PARTIALLY_REFUNDED` | `REFUNDED` | Staff Remaining Balance Refund | `REFUNDED` |

---

## 2. Illegal State Transitions

The state machine explicitly rejects and throws `BadRequestException` for invalid transitions:
- `FAILED` $\longrightarrow$ `PAID` (Must create a new payment record if retry is desired).
- `REFUNDED` $\longrightarrow$ `PAID` (Refunded transactions cannot be reopened).
- `PENDING` $\longrightarrow$ `REFUNDED` (Cannot refund unpaid drafts).
- `CANCELLED` $\longrightarrow$ `PAID` (Cannot settle cancelled drafts).

---

## 3. Atomic State Transition Invariant

Every state transition occurs within an atomic PostgreSQL transaction:
```sql
BEGIN;
  -- 1. Validate payment current state and lock row
  -- 2. Verify currency and exact amount
  -- 3. Update payments.status = 'PAID', paid_at = NOW()
  -- 4. Update orders.status = 'PAYMENT_CONFIRMED'
  -- 5. Insert order_status_histories record
  -- 6. Insert payment_events audit record
  -- 7. Insert payment_transactions charge record
COMMIT;
```
