# Database Architecture & Schema Specification

## 1. Overview
This document specifies the production database architecture for the **Intelligent Automotive E-Commerce & Business Management Platform**.

- **RDBMS:** PostgreSQL 16
- **ORM & Migrations:** Prisma ORM (v6.4.1)
- **Primary Key Strategy:** PostgreSQL-native UUIDv4 (`gen_random_uuid()` / `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`)
- **Active Extensions:** `pgcrypto` (UUID generation), `pg_trgm` (trigram fuzzy matching), `unaccent` (diacritic removal)
- **Monetary Types:** `Decimal(12, 2)` (strictly avoiding floating point imprecision)
- **Soft Deletes:** `deletedAt DateTime?` on master entities (User, CustomerProfile, Category, Brand, Product)

---

## 2. Bounded Contexts & Entity Models

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. IDENTITY & ACCESS CONTROL                    │
│   User ──< UserRole >── Role ──< RolePermission >── Permission         │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             2. CUSTOMER                                │
│   User (optional) ──1:1── CustomerProfile ──1:N── CustomerAddress     │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        3. VEHICLE DOMAIN (YMMET)                       │
│   VehicleMake ──1:N── VehicleModel ──1:N── VehicleGeneration           │
│                              │                                         │
│                              └──1:N── VehicleVariant (Engine, Body)    │
│                                              │                         │
│                                              ▼                         │
│                                       ProductFitment (Authoritative)   │
│                                              ▲                         │
└──────────────────────────────────────────────┼─────────────────────────┘
                                               │
┌──────────────────────────────────────────────┴─────────────────────────┐
│                           4. PRODUCT CATALOG                           │
│   Category (Hierarchical) ──1:N── Product ──1:N── Brand               │
│                                     │                                  │
│   ├── ProductPrice (GENERAL, GARAGE, SHOP tiers)                       │
│   ├── ProductCrossReference (OEM, AFTERMARKET, SUPPLIER)               │
│   ├── ProductImage (URLs, SortOrder, IsPrimary)                        │
│   └── ProductAttributeValue ──> ProductAttribute                       │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴──────────────────────────────────┐
│                             5. INVENTORY                               │
│   Warehouse ──1:N── InventoryItem ──N:1── Product                      │
│        │                                     │                         │
│        └────────1:N── StockMovement (Ledger) ┘                         │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴──────────────────────────────────┐
│                          6. COMMERCE & ORDERS                          │
│   CustomerProfile ──1:N── Order ──1:N── OrderItem (Immutable Snapshot)│
│                             │                                          │
│                             ├──1:N── OrderStatusHistory                │
│                             ├──1:N── Payment (PromptPay, Bank, Card)   │
│                             └──1:N── Shipment (Kerry, Flash, SCG)      │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴──────────────────────────────────┐
│                             7. AUDIT LOG                               │
│   User (optional) ──1:N── AuditLog (Append-Only JSON Audit Trail)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Entity Inventory

### 3.1. Identity & Access Control
- **`users`**: Master authentication entity with hashed credentials (`password_hash`), activation flags, and verification timestamps.
- **`roles`**: System roles (`SUPER_ADMIN`, `ADMIN`, `CATALOG_MANAGER`, `INVENTORY_MANAGER`, `ORDER_MANAGER`, `MARKETING_MANAGER`, `CUSTOMER_SERVICE`, `FINANCE`, `WAREHOUSE_MANAGER`).
- **`permissions`**: Granular resource-action pairs (`product.create`, `order.cancel`, etc.).
- **`user_roles`**: Many-to-many junction connecting users to assigned roles.
- **`role_permissions`**: Many-to-many junction assigning permissions to roles.

### 3.2. Customer Domain
- **`customer_profiles`**: B2C and B2B profiles supporting `CUSTOMER`, `GARAGE`, and `SHOP` types with verification status and tax IDs.
- **`customer_addresses`**: Multi-address management tailored for Thai postal standards (`subdistrict`, `district`, `province`, `postal_code`).

### 3.3. Vehicle Hierarchy & Deterministic Fitment
- **`vehicle_makes`**: Vehicle manufacturers (Toyota, Honda, Mazda, Isuzu, etc.).
- **`vehicle_models`**: Models scoped to make (Civic, Fortuner, D-Max, etc.).
- **`vehicle_generations`**: Specific model body generations and production year spans (Civic FC 2016–2021, Civic FE 2021–Present).
- **`vehicle_engines`**: Engine specifications, displacements, fuel types, and aspiration.
- **`vehicle_variants`**: Full vehicle configurations (Generation + Engine + Transmission + Drivetrain + Body Type).
- **`product_fitments`**: Authoritative compatibility table linking parts to variants with installation position (`Front Axle`, `Rear Axle`, `ALL`) and notes.

### 3.4. Master Catalog & Tiered Pricing
- **`categories`**: Recursive self-referencing tree for multi-level automotive taxonomy.
- **`brands`**: Part manufacturers (Akebono, TRW, Brembo, Denso, Bosch, NGK, Sakura, Mobil 1).
- **`products`**: Master SKU entity with weights, dimensions, warranty, and publication status.
- **`product_prices`**: Separate pricing table enforcing tier-based pricing (`GENERAL`, `GARAGE`, `SHOP`) using `Decimal(12,2)`.
- **`product_cross_references`**: OEM and aftermarket part interchangeability indexing.
- **`product_images`**: External media URLs and primary image flags (zero Base64 storage).
- **`product_attributes` & `product_attribute_values`**: Flexible automotive specification attributes (Viscosity, Material, Voltage, Pad Position).

### 3.5. Inventory & Multi-Warehouse
- **`warehouses`**: Stock locations (`WH-MAIN`, `WH-BKK-01`).
- **`inventory_items`**: Stock tracking with `on_hand`, `reserved`, `reorder_point`, and `reorder_quantity`.
- **`stock_movements`**: Immutable audit ledger recording `PURCHASE_RECEIPT`, `SALE`, `RESERVATION`, `RELEASE`, `ADJUSTMENT`, and `TRANSFER`.

### 3.6. Orders, Payments, Shipping & Audit
- **`orders`**: Master order record with currency, subtotal, discount, shipping, tax, and grand total.
- **`order_items`**: Immutable line items snapshotting product name, SKU, unit price, tax, discount, and JSON specifications at the time of order placement.
- **`order_status_histories`**: State machine audit transitions.
- **`payments`**: Payment transaction tracking with provider reference and status.
- **`shipping_methods` & `shipments`**: Carrier tracking and fulfillment status.
- **`audit_logs`**: Append-only administrative change ledger with before/after JSON snapshots.

---

## 4. Key Architecture Decisions & Conventions

### 4.1. Primary Keys & UUIDs
All tables use PostgreSQL-native UUIDv4 generated via `gen_random_uuid()`. This prevents ID enumeration attacks and facilitates distributed microservices or multi-region scaling.

### 4.2. Monetary Values & Financial Integrity
All monetary columns (`price`, `compare_at_price`, `cost_price`, `subtotal`, `tax_total`, `discount_total`, `grand_total`, `amount`, `base_price`) are strictly typed as `Decimal @db.Decimal(12, 2)`.

### 4.3. Soft Deletion
Master data entities (`User`, `CustomerProfile`, `Category`, `Brand`, `Product`) include `deletedAt DateTime?`. Transactional records (`Order`, `OrderItem`, `Payment`, `StockMovement`, `AuditLog`) are **never** soft-deleted to maintain strict financial and regulatory audit trails.

### 4.4. Indexes & Performance Optimization
- **SKU & Slug:** Unique B-Tree indexes.
- **Foreign Keys:** Explicit indexes on all foreign key columns (`makeId`, `modelId`, `productId`, `warehouseId`, `customerId`, `orderId`).
- **Fuzzy Search Preparation:** `pg_trgm` and `unaccent` enabled for fast trigram similarity searches on OEM numbers and product titles.
- **Composite Uniques:** Enforced on `[productId, tier]`, `[warehouseId, productId]`, `[productId, vehicleVariantId, position]`, and `[productId, referenceType, referenceNumber]`.

---

## 5. Legacy SQLite Migration Strategy (Future Reference)
Legacy SQLite data from `database.sqlite` will **not** be blindly migrated due to plaintext passwords, Base64 images, and denormalized vehicle strings. Instead, during vertical slice rollout:
1. Product categories and brands are normalized into the hierarchical taxonomy.
2. Products are imported via clean ETL scripts transforming loose vehicle strings into structured `product_fitments`.
3. Legacy users will undergo an enforced password reset upon their first login to store secure Argon2id hashes.
