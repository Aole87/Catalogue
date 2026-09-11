# Webhook Security & Idempotency Guide (Phase M7)

## 1. Webhook Verification Pipeline

Incoming webhooks at `POST /api/v1/payments/webhooks/:provider` pass through a strict multi-layer verification pipeline:

```
Webhook Inbound
      │
      ▼
1. Timestamp Tolerance Check (≤ 300 seconds) ──[Fail]──> Reject (400)
      │
      ▼
2. HMAC-SHA256 Signature Verification ─────────[Fail]──> Reject (400)
      │
      ▼
3. Idempotency Check (`WebhookEvent` table) ───[Duplicate]─> Return 200 (ALREADY_PROCESSED)
      │
      ▼
4. Reference Resolution (Internal / Provider) ──[Not Found]─> Reject (404)
      │
      ▼
5. Currency Invariant (THB only) ───────────────[Wrong]──> Reject (400)
      │
      ▼
6. Exact Amount Matching (`provider == order`) ──[Mismatch]─> Reject (400)
      │
      ▼
7. Atomic DB State Transition (PAID / CONFIRMED)
```

---

## 2. Replay Attack Protection
To prevent attackers from capturing and replaying valid signed webhooks:
- Each webhook must supply a timestamp header (`X-Timestamp`).
- The server checks $|\text{Server Time} - \text{Webhook Timestamp}| \le 300\text{ seconds}$.
- Expired timestamps are rejected immediately.

---

## 3. Cryptographic Signature Verification
- Payloads are signed with `HMAC-SHA256` using the provider-specific webhook secret.
- Constant-time comparison `crypto.timingSafeEqual()` is used to eliminate timing side-channel attacks.

---

## 4. Persistent Database Idempotency
- Provider events are recorded in `webhook_events` table with composite unique index `@@unique([provider, eventId])`.
- If an event with the same ID arrives again, the system recognizes it as duplicate and returns `{ status: 'ALREADY_PROCESSED', duplicate: true }` without executing side effects or creating duplicate audit rows.
- Concurrency races on identical event IDs are caught via unique constraint handling (`P2002`).
