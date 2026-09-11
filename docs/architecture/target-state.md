# Target State Architecture

## 1. Architectural Vision
The target architecture transforms the prototype into a production-grade, enterprise-scale **Intelligent Automotive E-Commerce & Business Management Platform** powered by **PostgreSQL, Prisma ORM, Node.js / TypeScript API, and modern React frontend**.

```
[ FRONTEND APPLICATION / SPA ]
  │
  ├── Customer Front Office (Next.js / Vite React)
  │    ├── Vehicle Selector (Year-Make-Model-Engine-Trim / VIN)
  │    ├── Intelligent & Faceted Catalog Search
  │    ├── AI Parts Advisor (LLM Assistant with Fitment Verification Guardrails)
  │    ├── Cart & Multi-Tier B2C/B2B Pricing Engine
  │    ├── Checkout & Thai Localized Payment (PromptPay QR, Credit Card, Bank Transfer)
  │    └── Customer Account & Order Tracking
  │
  └── Admin Back Office (FlatLab Design System)
       ├── Master Catalog & Tiered Pricing Manager
       ├── Authoritative Multi-Vehicle Fitment Matrix
       ├── Multi-Warehouse Inventory & Replenishment
       ├── Purchase Orders & Supplier Records
       ├── Order Processing, Invoicing & Fulfillment
       ├── B2B Garage/Shop Verification & Credit Terms
       ├── Promotions, Coupons & Loyalty Program
       └── RBAC, System Health, and Audit Logging
  │
  ▼ [ REST / tRPC API v1 Layer (Node.js + Express / Fastify / Next.js) ]
  ├── Auth Middleware (JWT / Secure HttpOnly Cookies / argon2 / RBAC)
  ├── Fitment Engine (Deterministic YMME resolution)
  ├── Pricing Service (Tier resolution + Promotion calculations)
  ├── Inventory Engine (Atomic reservations & Warehouse stock tracking)
  ├── Order State Machine (Draft -> Pending -> Paid -> Processing -> Shipped -> Completed)
  ├── AI Guardrail Layer (Validates AI recommendations against authoritative fitment)
  └── Audit Logging Interceptor
  │
  ▼ [ DATA ACCESS LAYER (Prisma ORM) ]
  │
  ▼ [ PRODUCTION DATABASE: PostgreSQL 16+ ]
  ├── Relational Core (Tables with UUIDs, Timestamps, Soft Deletes, Strict FKs)
  ├── Search Capabilities (pg_trgm, unaccent, Full-text Search)
  └── Vector Embeddings (pgvector for semantic search & AI Advisor)
```

---

## 2. Target Domain Model & Entities

### Core Bounded Contexts

#### A. Master Catalog & Fitment (Authoritative)
- `Category` (Hierarchical self-referencing tree)
- `Brand` (Part manufacturers e.g., Bosch, Denso, Brembo)
- `Product` (Master SKU, part numbers, OEM numbers, bar codes, specifications)
- `ProductPrice` (Multi-tiered prices: Retail, Auto Shop, Garage, Wholesale)
- `ProductCrossReference` (Interchangeable part mapping: OEM to aftermarket)
- `VehicleMake` (e.g., Toyota, Honda, Mazda)
- `VehicleModel` (e.g., Camry, Civic, 3)
- `VehicleGeneration` / `VehicleYear` (e.g., XV70, 2018–2024)
- `VehicleEngine` / `VehicleTransmission` / `VehicleTrim`
- `ProductFitment` (Authoritative junction linking Product SKU to exact vehicle configurations with position notes e.g., Front Left, Rear Right)

#### B. Inventory & Multi-Warehouse
- `Warehouse` (Main Distribution Center, Branch Store, Local Hub)
- `InventoryItem` (Quantity On Hand, Reserved, Available, Reorder Point)
- `StockMovement` (Inbound Purchase, Outbound Sale, Transfer, Adjustment, Damage)
- `StockReservation` (Time-limited reservation during checkout to prevent overselling)

#### C. Purchasing & Suppliers
- `Supplier` (Vendor details, lead times, payment terms)
- `PurchaseOrder` & `PurchaseOrderItem` (PO lifecycle: Draft -> Ordered -> Received -> Billed)

#### D. Commerce & Orders
- `Cart` & `CartItem` (Server-persisted and guest-session carts)
- `Order` & `OrderItem` (Immutable snapshot of product title, SKU, price, tax, discount)
- `OrderTimeline` / `OrderStatusHistory` (State machine transitions)
- `Payment` (PromptPay QR, Omise/Stripe Card, Bank Transfer slip upload)
- `Shipment` (Courier tracking: Kerry, Flash, SCG Express, J&T)

#### E. Customers & CRM
- `User` & `CustomerProfile` (Personal details, Tax ID / Branch for e-Tax invoice)
- `BusinessProfile` (Garage / Shop certification, verification status, credit limits)
- `CustomerAddress` (Shipping and billing addresses with Thai tambon/amphoe/province)
- `CustomerVehicle` ("My Garage" saved vehicles for instant fitment filtering)

#### F. Promotions, Coupons & Loyalty
- `Promotion` & `Coupon` (Percentage, fixed amount, tier-restricted, category-restricted)
- `LoyaltyAccount` & `LoyaltyTransaction` (Points earn and redemption)

#### G. Security, RBAC & Audit
- `AdminUser` & `Role` & `Permission`
- `AuditLog` (Actor, action, target entity, timestamp, IP address, before/after JSON payload)

---

## 3. Technology Stack Modernization Plan

| Component | Target Technology | Rationale |
| :--- | :--- | :--- |
| **Database** | PostgreSQL 16+ | Enterprise relational integrity, ACID transactions, JSONB, concurrency |
| **ORM** | Prisma ORM | Type-safe queries, automated migrations, declarative schema |
| **Backend API** | Node.js (TypeScript) + Fastify/Express or Next.js Route Handlers | High throughput, strict type safety, shared validation with frontend |
| **Validation** | Zod | Runtime request validation and shared TypeScript schema inference |
| **Authentication** | Argon2 + JWT / Secure Session Cookies | Industry-standard password hashing, stateless or Redis-backed sessions |
| **Object Storage** | S3-compatible (MinIO / Cloudflare R2 / AWS S3) | High-speed CDN asset delivery; removes base64 bloat from DB |
| **Search Engine** | PostgreSQL `pg_trgm` + Full-Text Search | Fast SKU, OEM cross-reference, and Thai/English full-text matching |
| **AI Advisor** | OpenAI / Gemini API with Structured Tool Calling | Natural language consultation constrained to authoritative fitment queries |
| **DevOps / Container** | Docker + Docker Compose + GitHub Actions | Reproducible environments across development, staging, and production |
