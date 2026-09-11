# Phase M11 Test Suite & Verification Matrix

## 1. Overview

Phase M11 includes a dedicated 45-scenario automated end-to-end integration test suite located at [`scripts/m11-test.ts`](file:///Users/ibookky/Catalogue/car-parts-catalog/scripts/m11-test.ts).

The suite validates all supplier master workflows, product mappings, purchase order state transitions, four-eyes separation of duties, partial/full receiving, over-receiving guards, M10 stock integration, and RBAC security boundaries.

---

## 2. Test Execution

To execute the M11 suite independently:
```bash
npx tsx scripts/m11-test.ts
```

To execute the full platform regression suite (M1–M11, 299 tests):
```bash
npm test
```

---

## 3. Detailed 45-Test Scenario Breakdown

### Group 1: Supplier Master Data (Tests 1–7)
- `1.1`: Create supplier with valid details, normalized code, and default NET30 payment terms.
- `1.2`: Reject duplicate supplier code with `409 Conflict`.
- `1.3`: Fetch supplier by ID with relationship counts.
- `1.4`: Update supplier contact, phone, and lead time days.
- `1.5`: Paginate and filter suppliers by search keyword.
- `1.6`: Inactivate supplier (`isActive: false`) and verify filter exclusions.
- `1.7`: Soft-delete supplier with existing history.

### Group 2: Supplier-Product Mapping (Tests 8–13)
- `2.1`: Create supplier-product mapping with cost price, MOQ, and pack size.
- `2.2`: Reject duplicate mapping for the same supplier and product.
- `2.3`: Designate preferred supplier and verify other supplier mappings for the product are unset.
- `2.4`: Update supplier SKU, cost price, and MOQ constraints.
- `2.5`: List product mappings for a specific supplier.
- `2.6`: Delete supplier-product mapping.

### Group 3: Purchase Order Lifecycle & State Machine (Tests 14–22)
- `3.1`: Create PO in `DRAFT` status with sequential `PO-YYYYMMDD-XXXXX` number.
- `3.2`: Calculate subtotal, 7% VAT, and total amounts accurately using Decimal arithmetic.
- `3.3`: Update PO draft items and quantities.
- `3.4`: Submit PO draft to `PENDING_APPROVAL`.
- `3.5`: Enforce Four-Eyes Rule: Reject PO approval when approver is the creator.
- `3.6`: Permit Four-Eyes approval by an independent Store Manager (`PENDING_APPROVAL` $\to$ `APPROVED`).
- `3.7`: Permit Super Admin self-approval emergency override with audit trail.
- `3.8`: Reject PO with mandatory rejection reason (`PENDING_APPROVAL` $\to$ `REJECTED`).
- `3.9`: Send approved PO to supplier (`APPROVED` $\to$ `SENT`).

### Group 4: Goods Receipt & Partial Receiving (Tests 23–32)
- `4.1`: Create Goods Receipt for `SENT` PO with sequential `GRN-YYYYMMDD-XXXXX` number.
- `4.2`: Partial receiving updates PO status to `PARTIALLY_RECEIVED`.
- `4.3`: Complete remaining receiving updates PO status to `RECEIVED`.
- `4.4`: Reject over-receiving when accepted quantity exceeds ordered quantity (`400 Bad Request`).
- `4.5`: Track rejected / damaged goods without incrementing stock balances.
- `4.6`: Prevent goods receipt for `DRAFT` or `PENDING_APPROVAL` POs.
- `4.7`: Prevent goods receipt for `CANCELLED` POs.
- `4.8`: Close partially fulfilled PO (`PARTIALLY_RECEIVED` $\to$ `CLOSED`).
- `4.9`: Close fully received PO (`RECEIVED` $\to$ `CLOSED`).
- `4.10`: Cancel PO in `DRAFT`, `PENDING_APPROVAL`, or `APPROVED` status.

### Group 5: Procurement-to-Inventory Integration (Tests 33–38)
- `5.1`: Goods receipt increments `InventoryItem.onHand` balance in the designated warehouse.
- `5.2`: Goods receipt appends an immutable `StockMovement` row with `movementType: PURCHASE_RECEIPT`.
- `5.3`: Stock movement records GRN and PO references in audit fields.
- `5.4`: Atomic transaction rollback on inventory receiving failure.
- `5.5`: Row-level locking protects against concurrent duplicate receiving.
- `5.6`: Verify zero direct stock mutations from M11 outside `InventoryService` authority.

### Group 6: Procurement RBAC & Security (Tests 39–45)
- `6.1`: `SUPER_ADMIN` can access all procurement operations.
- `6.2`: `STORE_MANAGER` can manage suppliers, create/submit/approve POs, and receive stock.
- `6.3`: `INVENTORY_CLERK` can create PO drafts, send approved POs, and receive stock, but cannot approve POs.
- `6.4`: `ACCOUNTANT` has read-only access to suppliers, POs, and GRNs.
- `6.5`: `SALES_REP` cannot access procurement endpoints (`403 Forbidden`).
- `6.6`: `CUSTOMER` role is strictly barred from all procurement routes (`403 Forbidden`).
- `6.7`: Unauthenticated requests receive `401 Unauthorized`.
