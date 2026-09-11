# Order Management Testing & Verification Matrix

## Automated Test Suite: `scripts/m9-test.ts` (25 Tests)

| ID | Test Name | Assertion Target |
|---|---|---|
| `M9-T01` | Order State Machine Legal Sequential Transitions | Validates linear transition path through lifecycle |
| `M9-T02` | Illegal State Jump Rejection | Verifies 400 Bad Request on illegal jumps |
| `M9-T03` | Customer Order History with Filters & Pagination | Tests `/my-orders` pagination, filters, and schema |
| `M9-T04` | Customer Order Detail Query with Full Snapshot | Asserts complete product, customer, and shipping snapshots |
| `M9-T05` | Customer IDOR Protection & Public Masking | Asserts 403 Forbidden on cross-customer UUID/orderNumber queries; asserts masked PII on unauthenticated lookups |
| `M9-T06` | Order Timeline Synthesis | Asserts chronological sorting across 3 domain event streams |
| `M9-T07` | Customer Cancellation of PENDING_PAYMENT Order | Verifies order transitions to CANCELLED |
| `M9-T08` | Customer Cancellation of PAYMENT_CONFIRMED Order | Verifies refund eligibility note without synthetic refund |
| `M9-T09` | Customer Cancellation Rejection after Shipment | Verifies rejection once parcel dispatched |
| `M9-T10` | Customer Return Request on DELIVERED Order | Verifies transition to RETURN_REQUESTED |
| `M9-T11` | Return Request Rejection on Unfulfilled Orders | Rejects return before delivery |
| `M9-T12` | Staff Return Approval | Transitions to RETURNED |
| `M9-T13` | Staff Return Rejection | Reverts to DELIVERED with staff audit notes |
| `M9-T14` | Staff Order Multi-Field Search | Keyword search across order #, customer email, tracking # |
| `M9-T15` | Staff Order Filtering | Multi-attribute filters (status, payment, date range) |
| `M9-T16` | Staff Order Sorting Whitelist | Validates whitelisted sort fields |
| `M9-T17` | Staff Order Pagination & Max Limit | Enforces 100 max limit cap |
| `M9-T18` | Staff Status Update with State Machine Validation & Illegal Jump Rejection | Validates state machine compliance, audit logging, and rejection of illegal status jumps |
| `M9-T19` | Staff Cancellation with Reason | Validates staff cancellation with mandatory reason |
| `M9-T20` | Immutable Order Snapshots | Proves product price changes do not mutate existing orders |
| `M9-T21` | Payment <-> Order Sync & Stale Event Protection | Verifies Payment PAID maps to PAYMENT_CONFIRMED and prevents regression on SHIPPED/DELIVERED |
| `M9-T22` | Shipment <-> Order Sync & Stale Event Protection | Verifies Shipment IN_TRANSIT/DELIVERED maps to Order states and prevents regression on DELIVERED/RETURNED |
| `M9-T23` | Concurrency Handling | Verifies atomic state transitions under race conditions |
| `M9-T24` | RBAC Enforcement | Non-staff receive 403 on admin endpoints; staff roles verified |
| `M9-T25` | **Zero Stock Mutation Invariant** | Verifies zero inventory deduction in M9 (deferred to M10) |
