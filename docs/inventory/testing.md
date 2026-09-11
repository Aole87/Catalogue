# Phase M10 Testing Strategy & Verification

## 1. Test Automation Coverage

The Phase M10 test suite (`scripts/m10-test.ts`) contains 30 comprehensive integration test cases covering:

| Test ID | Test Scope | Verification Focus |
| :--- | :--- | :--- |
| `M10-T01` | Warehouse CRUD & RBAC | Admin create/update/delete vs Customer 403 |
| `M10-T02` | Location CRUD & Constraints | Unique constraint on `warehouseId + code` |
| `M10-T03` | Inventory Listing & Filters | Search, warehouse filter, pagination |
| `M10-T04` | Server Availability Formula | `available = onHand - reserved` across warehouses |
| `M10-T05` | Reservation Over-Allocation Rejection | Rejects when $requested > available$ |
| `M10-T06` | Concurrent Anti-Oversell Protection | `Promise.all` race condition with row-level locks |
| `M10-T07` | Reservation Release Lifecycle | Restores available stock on release |
| `M10-T08` | Reservation Commit Lifecycle | Deducts onHand and reserved on commitment |
| `M10-T09` | Duplicate Release Idempotency | Multiple releases do not double-restore stock |
| `M10-T10` | Duplicate Commit Idempotency | Multiple commits do not double-deduct stock |
| `M10-T11` | Positive & Negative Adjustments | `ADJUSTMENT_IN` and `ADJUSTMENT_OUT` mutations |
| `M10-T12` | Adjustment Invariant Enforcement | Reason required; prevents $onHand < reserved$ |
| `M10-T13` | Movement Ledger Generation | Appends ledger record on adjustment |
| `M10-T14` | Before/After Quantities Snapshot | Records snapshot before and after mutation |
| `M10-T15` | Warehouse Transfer Atomicity | Atomic source deduct and target increment with shared ref |
| `M10-T16` | Transfer Insufficient Stock Rejection| Rejects transfer when source available is insufficient |
| `M10-T17` | Low Stock Calculation & Filter | $available \le reorderPoint$ triggers LOW_STOCK |
| `M10-T18` | Safety Stock & Out of Stock | $available = 0$ triggers OUT_OF_STOCK |
| `M10-T19` | RBAC: Customer Mutation Block | Customer 403 Forbidden on adjustment and transfer |
| `M10-T20` | RBAC: Sales Rep Mutation Block | Sales Rep 403 Forbidden on raw adjustments |
| `M10-T21` | IDOR / Warehouse Isolation | Non-existent warehouse isolation |
| `M10-T22` | Return Restock vs Damaged Disposition| RESTOCK increments stock; DAMAGED quarantines |
| `M10-T23` | Order -> Inventory Integration | Linked reservations created from order checkouts |
| `M10-T24` | Shipping Boundary Preservation | Shipping status/tracking authority preserved |
| `M10-T25` | Payment Boundary Validation | Payment lifecycle untouched by inventory operations |
| `M10-T26` | Transaction Rollback on Failure | Atomic rollback on partial transfer failure |
| `M10-T27` | Stale Event / Released Commit Block | Cannot commit released/expired reservations |
| `M10-T28` | Movement Append-Only Invariant | Ledger count strictly increases |
| `M10-T29` | AuditLog Entry Verification | Audit log generated for critical actions |
| `M10-T30` | Full M1–M9 Regression Pass | All baseline domains functional |

## 2. Running the Test Suite

```bash
# Run M10 test suite standalone
npm run m10:test

# Run entire platform regression test suite (M1–M10)
npm test
```
