# Phase M8 Testing & Verification Matrix

## 1. Test Suite Summary
Automated test suite `scripts/m8-test.ts` exercises all 25 validation criteria for Phase M8:

```bash
npm run m8:test
# or full regression suite:
npm test
```

---

## 2. Test Execution Matrix (25/25 PASSED)

| Test ID | Test Category | Description | Result |
| :--- | :--- | :--- | :---: |
| **M8-T01** | Rates & Methods | Shipping method selection & active carrier rates query | ✅ PASS |
| **M8-T02** | Payment Boundary | Reject fulfillment of UNPAID order (`PENDING_PAYMENT` $\to$ 400 Bad Request) | ✅ PASS |
| **M8-T03** | Shipment Creation | Generate unique `SHP-` number & initial `PENDING` status for paid order | ✅ PASS |
| **M8-T04** | Address Snapshot | Immutable delivery address snapshotting (isolated from profile changes) | ✅ PASS |
| **M8-T05** | Pricing Authority | Server-authoritative shipping cost calculation from `ShippingMethod` | ✅ PASS |
| **M8-T06** | Audit Trail | Append-only `ShippingEvent` checkpoint logging on creation | ✅ PASS |
| **M8-T07** | Staff Workflow | Staff state transitions: `PENDING` $\to$ `READY_TO_FULFILL` $\to$ `PACKING` | ✅ PASS |
| **M8-T08** | Tracking Assignment | `PACKING` $\to$ `READY_TO_SHIP` with courier tracking number assignment | ✅ PASS |
| **M8-T09** | Courier Adapter | Flash Express tracking number generator & format validation (`TH...F`) | ✅ PASS |
| **M8-T10** | Courier Adapter | Kerry Express tracking number generator & format validation (`KEX...`) | ✅ PASS |
| **M8-T11** | Courier Adapter | Test Shipping Provider deterministic flow & signature generation | ✅ PASS |
| **M8-T12** | State Machine | `READY_TO_SHIP` $\to$ `SHIPPED` synchronizes `Order.status = SHIPPED` | ✅ PASS |
| **M8-T13** | State Machine | Illegal state jumps (e.g. `PENDING` $\to$ `DELIVERED`) strictly rejected | ✅ PASS |
| **M8-T14** | Courier Webhook | Inbound webhook with valid HMAC-SHA256 signature updates status | ✅ PASS |
| **M8-T15** | Security | Invalid cryptographic webhook signature rejected with 400 Bad Request | ✅ PASS |
| **M8-T16** | Idempotency | Duplicate webhook event replay safely absorbed (`duplicate: true`) | ✅ PASS |
| **M8-T17** | State Protection | Out-of-order stale webhook cannot downgrade `DELIVERED` shipment | ✅ PASS |
| **M8-T18** | Final Delivery | `OUT_FOR_DELIVERY` $\to$ `DELIVERED` sets `deliveredAt` & `Order.status = DELIVERED` | ✅ PASS |
| **M8-T19** | Immutability | Terminal state immutability: cannot assign tracking to `DELIVERED` | ✅ PASS |
| **M8-T20** | Cancellation | Shipment cancellation workflow before dispatch sets `CANCELLED` | ✅ PASS |
| **M8-T21** | Boundary | Cannot cancel already `SHIPPED` / `DELIVERED` parcel (400 Bad Request) | ✅ PASS |
| **M8-T22** | Authorization | Customer IDOR protection: cannot query another customer's shipment | ✅ PASS |
| **M8-T23** | Customer Privacy | Public tracking lookup masks customer recipient name & phone | ✅ PASS |
| **M8-T24** | Staff Dashboard | Admin fulfillment dashboard query with status & carrier pagination | ✅ PASS |
| **M8-T25** | Boundary Invariant | **Zero Stock Mutation Invariant:** Verifies inventory unaltered in M8 | ✅ PASS |

---

## 3. Full Regression Baseline Results

| Suite | Tests | Result |
| :--- | :---: | :---: |
| `db:test` (Database Health & Seed Invariants) | 13 / 13 | ✅ PASS |
| `api:test` (Core Fastify API & Endpoints) | 24 / 24 | ✅ PASS |
| `m3:test` (Fitment & Vehicle Catalog) | 30 / 30 | ✅ PASS |
| `m4:test` (Product Catalog & Inventory Foundation) | 32 / 32 | ✅ PASS |
| `m5:test` (Auth, Session & Security Matrix) | 15 / 15 | ✅ PASS |
| `m6:test` (Cart, Checkout & Pricing Authority) | 25 / 25 | ✅ PASS |
| `m7:test` (Payment Gateway Integration & Lifecycle) | 25 / 25 | ✅ PASS |
| `m8:test` (Shipping Integration & Fulfillment) | 25 / 25 | ✅ PASS |
| **TOTAL** | **189 / 189** | **100% PASSED** |
