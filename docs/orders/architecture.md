# Phase M9 — Order Architecture & Domain Model

## 1. Domain Overview
Phase M9 introduces the comprehensive **Order Management & Order Lifecycle Domain** for the Intelligent Automotive E-Commerce platform. It bridges Customer checkout (M6), Financial payments (M7), and Fulfillment tracking (M8) into a unified, server-authoritative, auditable state machine.

```
       [Customer Cart / Checkout (M6)]
                      │
                      ▼
         [Order Created: PENDING_PAYMENT]
                      │
             (Payment Confirmed M7)
                      │
                      ▼
        [Order: PAYMENT_CONFIRMED]
                      │
         (Warehouse Fulfillment M8)
                      │
                      ▼
            [Order: PROCESSING]
                      │
                      ▼
        [Order: READY_FOR_SHIPMENT]
                      │
               (Carrier Handover)
                      │
                      ▼
             [Order: SHIPPED]
                      │
                (Delivery)
                      │
                      ▼
            [Order: DELIVERED]
             ╱               ╲
    (Return Requested)    (Completed)
           │
           ▼
    [RETURN_REQUESTED]
     ╱              ╲
 (Approve)       (Reject)
    │                │
    ▼                ▼
[RETURNED]      [DELIVERED]
```

## 2. Core Architectural Pillars
1. **Server-Authoritative State:** State transitions are guarded by `OrderStateMachine` with strict transition maps.
2. **Immutable Order Snapshots:** `OrderItem` and `Shipment` maintain static JSON and field snapshots of product pricing, SKU, names, and address snapshots at checkout time.
3. **Cross-Domain Synchronization:** Asynchronous callbacks and domain events from M7 (Payments) and M8 (Shipping) automatically update Order states without domain coupling.
4. **Tenant & IDOR Protection:** Customer endpoints enforce ownership verification (`customerId == user.customerProfile.id`). Unauthenticated guest lookups on public order endpoints use a sanitized public projection with strict PII masking (names, phones, emails, and addresses masked; internal notes and audit trails stripped). Cross-customer lookups by authenticated users are rejected with `403 Forbidden`. Staff endpoints enforce role-based access control using the approved M2 role matrix:
   - `SUPER_ADMIN` / `ADMIN`: Unrestricted system & order administration.
   - `STORE_MANAGER`: General order management, status transitions, staff cancellations, return approvals.
   - `SALES_REP`: Customer operations, order lookup, and customer-assisted cancellations.
   - `INVENTORY_CLERK` / `WAREHOUSE`: Fulfillment & operational visibility, return inspection (no financial/cancellation authority).
   - `ACCOUNTANT`: Payment and financial refund visibility (no physical order mutations).
   - `CUSTOMER`: Own orders only.
5. **Full Auditability:** Every transition records an `OrderStatusHistory` entry and creates an immutable `AuditLog`.
6. **Zero Inventory Mutation Boundary:** Strictly preserves Phase M10 boundaries. No inventory deduction, reservation, or stock movement mutation occurs in M9.
