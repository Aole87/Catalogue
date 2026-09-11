# Phase M10: Inventory & Warehouse Architecture

## 1. System Topology & Authority

In the platform architecture, Phase M10 establishes the **Inventory Management & Warehouse Operations** domain as the authoritative source of truth for stock quantities, reservations, physical warehouse locations, and stock mutations.

```
Customer
   ↓
Storefront
   ↓
Cart / Checkout (M6)
   ↓
Payment Gateway (M7)
   ↓
Order Management (M9)
   ↓
Shipping Integration (M8)
   ↓
Inventory & Warehouse (M10)  ← [Authoritative Stock & Warehouse Domain]
```

## 2. Core Domain Principles

1. **Server-Authoritative Quantities**:
   - Stock availability calculations and mutation rules are calculated on the server and verified inside ACID database transactions.
   - Client applications never dictate stock levels or bypass reservation checks.
2. **Formula Invariant**:
   $$\text{Available Stock} = \text{On-Hand Stock} - \text{Reserved Stock}$$
   - Any attempt to reserve or deduct stock when $\text{Requested} > \text{Available}$ is rejected with conflict errors.
3. **Pessimistic Row-Level Concurrency Control**:
   - Concurrent reservation and mutation requests execute `SELECT ... FOR UPDATE` against `inventory_items` records inside Prisma transactions to eliminate overselling race conditions.
4. **Append-Only Movement Ledger**:
   - Every mutation produces an immutable record in `StockMovement` capturing before/after quantities, actor attribution, timestamp, reference type, and reference ID.
5. **Multi-Warehouse Isolation & Traceability**:
   - Inventory items and warehouse locations belong to explicit warehouses. Inter-warehouse movements are executed as atomic pairs (`TRANSFER_OUT` and `TRANSFER_IN`) sharing an immutable transfer reference.

## 3. Database Schema Layout

- `warehouses`: Physical and distribution hubs (`WH-MAIN`, `WH-BRANCH-2`).
- `warehouse_locations`: Granular storage coordinates (Zone, Rack, Shelf, Bin) with unique constraints per warehouse.
- `inventory_items`: Current physical balance (`on_hand`, `reserved`, `safety_stock`, `reorder_point`).
- `stock_reservations`: Time-bound or order-bound stock hold records with lifecycle states (`ACTIVE`, `COMMITTED`, `RELEASED`, `EXPIRED`, `CANCELLED`).
- `stock_movements`: Append-only audit ledger of every quantity transition.
