# Architecture Decision Records (ADR)

## ADR-001: Architecture Modernization Strategy
- **Status:** **APPROVED**
- **Context:** The current application is a single-node desktop Electron prototype with an embedded SQLite database and no backend API. We need a production-grade, highly scalable platform to support B2C and B2B automotive e-commerce targeting THB 2M+/month.
- **Decision:** Adopt **Strategy B + C (Incremental Modernization via Vertical Slices)**:
  1. Keep the existing responsive React UI components and FlatLab design aesthetics as the visual baseline.
  2. Implement a unified backend API server with **PostgreSQL 16+ and Prisma ORM**.
  3. Decouple the frontend from direct Electron SQLite IPC by introducing a clean, typed API client.
  4. Build out missing domain modules (Fitment, Inventory, Orders, Payments, Auth) slice-by-slice.
- **Consequences:** Avoids a high-risk blind rewrite while systematically replacing insecure and prototype code with robust, enterprise-grade architecture.

---

## ADR-002: Authoritative Database & Server-Side Execution
- **Status:** **APPROVED**
- **Context:** Automotive e-commerce relies on strict business rules: multi-tiered pricing (Retail, Garage, Shop), inventory reservations, promo codes, and deterministic vehicle fitment.
- **Decision:** **The Database and Backend API are the sole source of truth.**
  - No pricing, discount calculation, or fitment compatibility verification will be accepted from frontend payloads.
  - Financial mutations and stock deductions must run within atomic PostgreSQL transactions (`prisma.$transaction`).
- **Consequences:** Complete elimination of client-side price tampering, negative inventory races, and fitment discrepancies.

---

## ADR-003: Deterministic Vehicle Fitment vs. AI Advisory
- **Status:** **APPROVED**
- **Context:** Customers must be guaranteed that purchased parts fit their specific vehicle. AI and semantic search are valuable for discovery, but LLMs are probabilistic and prone to hallucination.
- **Decision:** **Strict Separation of Search / AI from Fitment Verification.**
  - Structured relational fitment (`product_fitments` junction table) is authoritative.
  - The AI Parts Advisor may assist users in identifying problems or suggesting part categories, but it is strictly forbidden from declaring a part "compatible" unless verified against the structured fitment database via backend tool calling.
- **Consequences:** Zero customer returns due to hallucinated compatibility; builds high customer trust for garage owners.

---

## ADR-004: Immutable Order Snapshots
- **Status:** **APPROVED**
- **Context:** Product titles, prices, descriptions, and OEM codes change over time. Historical orders must remain legally and financially accurate for accounting and tax audits.
- **Decision:** When an order is placed, line items are persisted as immutable snapshot records (`OrderItem`) storing the exact SKU, title, unit price, applied tier, discount amount, and tax rate at purchase time. Future updates to the `Product` table will never alter historical `OrderItem` rows.
- **Consequences:** Full compliance with Thai revenue department accounting standards and e-Tax invoice integrity.

---

## ADR-005: Security Baseline & Authentication Standard
- **Status:** **APPROVED**
- **Context:** The prototype stores plaintext passwords and lacks token-based authentication.
- **Decision:**
  - Passwords will be hashed using **Argon2id** with individual cryptographic salts.
  - Authentication will issue **JWT / Session Tokens** stored in HttpOnly, Secure, SameSite cookies.
  - Server-side RBAC middleware will enforce role and permission checks on every protected route.
- **Consequences:** Mitigates critical security vulnerabilities SEC-01, SEC-02, and SEC-03.

---

## ADR-006: PostgreSQL 16 & Prisma ORM Foundation
- **Status:** **APPROVED**
- **Context:** The system requires enterprise concurrency, strict foreign keys, transactional boundaries, and structured migrations.
- **Decision:** Adopt **PostgreSQL 16** with **Prisma ORM 6** as the sole database tier for all production services.
- **Consequences:** Provides type-safe database queries, declarative migrations, and zero floating-point calculation errors.

---

## ADR-007: Native UUIDv4 Primary Key Strategy
- **Status:** **APPROVED**
- **Context:** Auto-incrementing integer IDs expose transaction volume and allow enumeration attacks across B2B/B2C accounts.
- **Decision:** Use PostgreSQL-native `gen_random_uuid()` with Prisma `@id @default(dbgenerated("gen_random_uuid()")) @db.Uuid` for all primary keys.
- **Consequences:** Secure, non-enumerable IDs across all entities without performance degradation.

---

## ADR-008: Decimal(12, 2) Monetary Precision
- **Status:** **APPROVED**
- **Context:** Float and Real types cause rounding errors in price calculations, tax computations, and discounts.
- **Decision:** All monetary columns are typed as `Decimal @db.Decimal(12, 2)`.
- **Consequences:** 100% precision in financial totals, accounting reports, and tax invoices.

---

## ADR-009: Normalized Year-Make-Model-Engine-Variant Fitment Matrix
- **Status:** **APPROVED**
- **Context:** Vehicle fitment in automotive e-commerce requires exact precision (e.g., front brake pads fit Civic FC 1.5 Turbo but not Civic FB 1.8).
- **Decision:** Implement a normalized vehicle hierarchy (`VehicleMake` -> `VehicleModel` -> `VehicleGeneration` -> `VehicleVariant`) and link products via `ProductFitment` junction table with position and condition attributes.
- **Consequences:** Authoritative vehicle compatibility checking with zero ambiguity.

---

## ADR-010: Product Pricing Separation & Multi-Tier Matrix
- **Status:** **APPROVED**
- **Context:** The business serves General Consumers (B2C), Workshops (Garage B2B), and Auto Parts Stores (Shop B2B) with distinct pricing structures.
- **Decision:** Separate pricing from the `Product` entity into `ProductPrice` with a composite unique constraint on `[productId, tier]`.
- **Consequences:** Enables flexible price tier management, cost tracking, promotional pricing, and scheduled price changes without altering the master SKU.

---

## ADR-011: Immutable Historical Snapshots for Order Items
- **Status:** **APPROVED**
- **Context:** If a product name, price, or description changes after an order is placed, historical invoices must not change.
- **Decision:** `OrderItem` copies the exact SKU, product name, unit price, discounts, and JSON specifications at purchase time.
- **Consequences:** Complete auditability and legal compliance for historical financial records.

---

## ADR-012: Append-Only Ledger for Inventory Stock Movements
- **Status:** **APPROVED**
- **Context:** Inventory quantities must be auditable across purchase receipts, sales, adjustments, and warehouse transfers.
- **Decision:** Every stock change is recorded as an immutable row in `StockMovement` ledger table.
- **Consequences:** Full visibility into stock shrinkage, vendor receiving history, and sales fulfillment.

---

## ADR-013: Fastify Node.js Framework for High-Performance API Backend
- **Status:** **APPROVED**
- **Context:** The automotive platform requires low-latency JSON serialization, high throughput, robust plugin encapsulation, and strict type safety.
- **Decision:** Adopt **Fastify v5** with TypeScript for the backend API tier.
- **Consequences:** Provides outstanding I/O performance, native schema validation hooks, streamlined plugin architecture, and first-class OpenAPI generation.

---

## ADR-014: Server-Managed Sessions with Hashed Tokens over Stateless JWTs
- **Status:** **APPROVED**
- **Context:** Storing JWTs in client browser storage is vulnerable to XSS and makes immediate session revocation impossible without a stateful blocklist.
- **Decision:** Implement **Server-Side Sessions** backed by PostgreSQL. 256-bit cryptographically random tokens are issued via `HttpOnly`, `Secure`, `SameSite` cookies, and only the one-way `SHA-256` token hash is stored in the database.
- **Consequences:** Mitigates XSS token extraction, enables instant server-side revocation on logout/password change, and protects stored sessions against database compromises.

---

## ADR-015: OWASP-Compliant Argon2id Password Hashing Strategy
- **Status:** **APPROVED**
- **Context:** Plaintext passwords and legacy hashes (MD5/SHA1/unsalted SHA256) are vulnerable to GPU-based rainbow table and cracking attacks.
- **Decision:** Hash all passwords using **Argon2id** (RFC 9106 recommended hybrid) with memory cost of 64MB (`65536 KiB`), 3 time iterations, and 4 threads.
- **Consequences:** State-of-the-art password security resistant to GPU cracking and side-channel timing attacks.

---

## ADR-016: Server-Authoritative Role-Based & Permission-Based Access Control (RBAC)
- **Status:** **APPROVED**
- **Context:** The system must strictly enforce separation of privileges between consumers, warehouse staff, sales reps, accountants, and system administrators.
- **Decision:** Implement a two-tier `User` -> `UserRole` -> `Role` -> `RolePermission` -> `Permission` schema. Authorization is enforced on every request using Fastify route hooks (`requireRole` and `requirePermission`).
- **Consequences:** Frontend authorization state is treated as purely cosmetic; the backend remains the sole authoritative gatekeeper.

---

## ADR-017: Multi-Layered CSRF Defense
- **Status:** **APPROVED**
- **Context:** Authentication via `HttpOnly` cookies requires robust protection against Cross-Site Request Forgery.
- **Decision:** Implement a defense-in-depth CSRF strategy:
  1. `SameSite=Lax` (development) / `SameSite=Strict` (production) cookies.
  2. Strict CORS whitelist rejecting unauthorized external web origins.
  3. Custom header validation (`X-Request-ID` / `Content-Type: application/json`) preventing simple HTML form submission exploits.
- **Consequences:** Comprehensive CSRF defense across modern and legacy browsers.

---

## ADR-018: Standardized RESTful API Versioning (`/api/v1`) & Error Handling Schema
- **Status:** **APPROVED**
- **Context:** Client integrations require predictable, versioned endpoints and structured error payloads.
- **Decision:** Prefix all business endpoints with `/api/v1` and standardize all errors to `{ error: { code, message, requestId, details } }`.
- **Consequences:** Enables zero-downtime future API evolution and consistent error reporting across frontend and backend.

---

## ADR-019: Process-Local Rate Limiting with Distributed Strategy Roadmap
- **Status:** **APPROVED**
- **Context:** Authentication endpoints require protection against credential stuffing and brute-force attacks.
- **Decision:** Deploy in-memory rate limiting via `@fastify/rate-limit` (10 req/min on auth, 100 req/min global). Document Redis adapter integration for future multi-node distributed deployment.
- **Consequences:** Immediate protection against local brute-force attacks with a clear scale-out roadmap.

---

## ADR-020: Server-Authoritative Multi-Tier Pricing Architecture
- **Status:** **APPROVED**
- **Context:** Automotive parts are priced differently for Retail Consumers (`GENERAL`), Repair Garages (`GARAGE`), and Auto Parts Stores (`SHOP`). Client-side pricing calculations or payload submissions are prone to tampering.
- **Decision:** The API backend resolves the active user's session tier on every request and returns the authoritative `effectivePrice` calculated from PostgreSQL `Decimal(12, 2)` records. Client requests cannot dictate prices or discount totals.
- **Consequences:** 100% price integrity, immunity to client-side tampering, and seamless support for future dynamic price rules.

---

## ADR-021: Category Tree In-Memory Graph Construction
- **Status:** **APPROVED**
- **Context:** Fetching deep category hierarchies recursively using multiple SQL queries introduces severe N+1 latency.
- **Decision:** `GET /api/v1/categories/tree` fetches all active categories in a single flat SQL query and builds the multi-level tree in-memory in $O(N)$ time.
- **Consequences:** Low response latency (<5ms) and linear memory scalability.

---

## ADR-022: Multi-Record Transactional Consistency for Master SKUs
- **Status:** **APPROVED**
- **Context:** Creating or modifying a product involves multiple dependent records (`ProductPrice`, `ProductImage`, `ProductAttributeValue`, `ProductCrossReference`).
- **Decision:** All multi-entity product mutations are executed within atomic PostgreSQL transactions (`prisma.$transaction`). Partial failures trigger an automatic rollback.
- **Consequences:** Prevents orphaned product attributes or missing prices in the catalog.

---

## ADR-023: PostgreSQL Trigram (`pg_trgm`) and Search Foundation
- **Status:** **APPROVED**
- **Context:** Automotive catalog search requires matching across Thai text, English brand names, alphanumeric SKUs, and OEM reference codes without heavy external infrastructure like Elasticsearch in early phases.
- **Decision:** Use PostgreSQL-native ILIKE and `pg_trgm` indexes across product name, SKU, description, brand, and cross-reference tables.
- **Consequences:** Fast, native search with zero additional infrastructure operational cost.

---

## ADR-024: Decommissioning Strategy for Legacy Electron SQL IPC in Product Catalog
- **Status:** **APPROVED**
- **Context:** M0 identified arbitrary SQL execution via Electron IPC (`window.electronAPI.query`) as critical technical debt (SEC-01).
- **Decision:** For Phase M3, all product browsing, search, and detail views are migrated to the Fastify `/api/v1` API. No new M3 code may call `window.electronAPI.query`.
- **Consequences:** Marks the first major vertical slice migration away from legacy SQLite IPC toward the production API boundary.

---

## ADR-025: Strict Separation of Deterministic Ground Truth vs AI Candidates in Compatibility Engine
- **Status:** **APPROVED**
- **Context:** Automotive fitment requires deterministic compatibility decisions based on authoritative structured fitment data to prevent costly return shipping, customer vehicle damage, and merchant liability. Probabilistic models (LLMs, vector embeddings, title text parsing) cannot guarantee precision across sub-generation splits.
- **Decision:** Compatibility is derived **exclusively** from structured PostgreSQL records (`ProductFitment` $\leftrightarrow$ `VehicleVariant`). AI/LLM models may only propose draft fitment candidates for catalog manager review in later phases, but cannot serve as the runtime fitment authority.
- **Consequences:** Eliminates hallucinations and false positives in compatibility verification.

---

## ADR-026: 5-Level Normalized Cascading Vehicle Master Data Model
- **Status:** **APPROVED**
- **Context:** Automotive parts compatibility varies across generation chassis codes (e.g. Yaris XP150 vs XP210) and engine types (e.g. 1.2L 3NR-FE vs 1.5L 2NR-FE). Flat Year/Make/Model strings lack necessary specificity.
- **Decision:** Implement a 5-level relational hierarchy: `VehicleMake` $\to$ `VehicleModel` $\to$ `VehicleGeneration` $\to$ `VehicleEngine` $\to$ `VehicleVariant`, enforced by PostgreSQL foreign keys and `RESTRICT` deletion rules.
- **Consequences:** Provides exact chassis and powertrain resolution with zero data redundancy.

---

## ADR-027: Machine-Readable Fitment Reason Codes for Client Predictability
- **Status:** **APPROVED**
- **Context:** Clients (storefront, mobile apps, customer service portals) need clear, machine-readable explanations for compatibility outcomes rather than generic boolean flags.
- **Decision:** The fitment check endpoint (`/api/v1/products/:productId/fitment/:vehicleVariantId`) returns explicit reason codes: `EXPLICIT_FITMENT`, `NO_FITMENT_RECORD`, `INSUFFICIENT_VEHICLE_SPECIFICATION`, `INVALID_PRODUCT`, `INVALID_VEHICLE`.
- **Consequences:** Facilitates deterministic UI messaging, contextual prompts, and automated test validation.

---

## ADR-028: Multi-Column Composite Uniqueness for Product Fitments
- **Status:** **APPROVED**
- **Context:** A product can fit multiple positions on the same vehicle (e.g., front and rear brake pads or universal fasteners), but duplicate identical entries cause data corruption.
- **Decision:** Enforce composite unique constraint `@@unique([productId, vehicleVariantId, position])` at the database level.
- **Consequences:** Prevents duplicate fitment mappings while allowing fine-grained position-specific fitments (e.g., Front Axle vs Rear Axle).

---

## ADR-029: Vehicle-First Customer Journey & Client State Lifecycle
- **Status:** **APPROVED**
- **Context:** Automotive customers shop primarily for their specific automobile rather than browsing generic part catalogs. Customer context needs to persist seamlessly across navigation without forcing repeated vehicle selection.
- **Decision:** Establish a React `VehicleContext` persisted in browser `localStorage` (`mobex_selected_vehicle`) storing display metadata and the authoritative `vehicleVariantId`. All catalog discovery queries automatically propagate `vehicleVariantId` as a server query parameter.
- **Consequences:** Creates an intuitive, vehicle-first shopping experience with zero state loss across deep links and refreshes.

---

## ADR-030: Total Prohibition of Client-Side Compatibility Inference & Mock Fallbacks
- **Status:** **APPROVED**
- **Context:** Early prototype contained client-side mock arrays (`MOCK_PRODUCTS`) and hardcoded fallback lists that bypassed backend validation.
- **Decision:** Completely eliminate all client-side mock products, mock vehicles, and fallback arrays from storefront pages. The frontend is strictly a presentation layer for the Fastify API.
- **Consequences:** Guarantees that only valid, active, and verified catalog data from PostgreSQL is rendered to users.

---

## ADR-031: Thai-First Technical Automotive Typography Scale
- **Status:** **APPROVED**
- **Context:** Automotive e-commerce in Thailand requires natural Thai readability alongside crisp alphanumeric rendering for OEM numbers, SKUs, chassis codes, and engine displacements.
- **Decision:** Standardize typography on `Noto Sans Thai` for primary Thai text paired with `Inter` for technical alphanumeric strings, SKU tags, and monetary numbers.
- **Consequences:** Consistent, highly legible typography across all device viewports.

---

## ADR-032: Honest UX Boundary for Future E-Commerce Phases
- **Status:** **APPROVED**
- **Context:** Cart, checkout, and inventory mutation workflows belong to subsequent phases (M6+). Placing fake buttons, simulated purchase flows, or fake reviews damages customer trust.
- **Decision:** Future integration points (such as Add to Cart or Order buttons) are either cleanly omitted or honestly indicated as inquiry/future features. No fake trust badges, fake stock counters, or simulated checkout processes are permitted.
- **Consequences:** Maintains high integrity and engineering honesty across the entire user experience.

---

## ADR-033: Server-Authoritative Shopping Cart & Multi-Tier Pricing Engine (Phase M6)
- **Status:** **APPROVED**
- **Context:** In automotive parts e-commerce, customer tiers (Retail `GENERAL`, Workshop `GARAGE`, Retailer `SHOP`) have dynamic price tiers. Client-side price calculations or submitting raw monetary values from browser payloads introduce severe tampering and security vulnerabilities.
- **Decision:** Shopping carts (`Cart`, `CartItem`) are stored and computed server-side in Fastify API. Line item unit prices, subtotal, taxes, shipping rules (free shipping over 2,000 THB), and grand totals are calculated dynamically using PostgreSQL `Decimal(12, 2)` arithmetic. Client payloads cannot specify or override prices or totals.
- **Consequences:** Absolute price integrity, immunity to client-side payload tampering, and seamless support for guest session tokens (`X-Session-Token`) and cart merging on login.

---

## ADR-034: Immutable Order Snapshotting & Atomic Checkout Workflow (Phase M6)
- **Status:** **APPROVED**
- **Context:** When an order is placed, subsequent changes to product titles, prices, brand descriptions, or fitment relations must not mutate historical transaction records, accounting receipts, or tax invoices.
- **Decision:** The checkout process (`POST /api/v1/checkout`) executes within an atomic PostgreSQL transaction (`prisma.$transaction`). It creates an `Order` record, generates an immutable snapshot for each `OrderItem` (storing locked SKU, name, unitPrice, lineTotal, and full JSON product snapshot), logs an initial `OrderStatusHistory` transition, drafts a `Payment` record, and clears the active cart in a single ACID commit.
- **Consequences:** Provides complete auditability, prevents race conditions, and guarantees immutable historical transaction records.

---

## ADR-035: Server-Authoritative Payment Lifecycle State Machine & Provider Abstraction (Phase M7)
- **Status:** **APPROVED**
- **Context:** Payment integrations require loose coupling to multiple payment methods (PromptPay Thai QR, Bank Transfer slip workflows, Credit Card gateways) while strictly enforcing financial security, state machine integrity, and prevention of client-side payment tampering.
- **Decision:** 
  1. Decouple business logic from vendors via a uniform `PaymentProvider` interface and factory (`PromptPayProvider`, `BankTransferProvider`, `TestPaymentProvider`).
  2. Implement an explicit, unidirectional state machine (`PaymentStateMachine`) rejecting invalid transitions such as `FAILED` $\to$ `PAID` or `REFUNDED` $\to$ `PAID`.
  3. Selecting a payment method or opening a QR code **never** marks an order as paid; only verified settlement transitions `Payment.status = PAID` and `Order.status = PAYMENT_CONFIRMED` inside an ACID transaction.
- **Consequences:** 100% financial integrity, immunity to fake client payment claims, and auditable financial lifecycle.

---

## ADR-036: Webhook Signature Verification, Replay Protection & Idempotency Strategy (Phase M7)
- **Status:** **APPROVED**
- **Context:** Payment webhooks arrive over public HTTP networks and can be forged, replayed, duplicated, or arrive out-of-order.
- **Decision:**
  1. Enforce cryptographic `HMAC-SHA256` signature verification on all inbound webhooks with timing-safe comparison (`crypto.timingSafeEqual`).
  2. Enforce timestamp tolerance windows ($\le 300$ seconds) to eliminate replay attacks.
---

## ADR-037: Shipment State Machine & Provider-Agnostic Carrier Abstraction (Phase M8)
- **Status:** **APPROVED**
- **Context:** Shipping and fulfillment require loose coupling with logistics couriers (Flash Express, Kerry Express, SCG Express, Lalamove, Test Carrier) while enforcing rigorous fulfillment workflows and auditability across warehouse stages (`PENDING` $\to$ `READY_TO_FULFILL` $\to$ `PACKING` $\to$ `READY_TO_SHIP` $\to$ `SHIPPED` $\to$ `IN_TRANSIT` $\to$ `OUT_FOR_DELIVERY` $\to$ `DELIVERED`).
- **Decision:**
  1. Implement a provider-agnostic `ShippingProvider` interface and `ShippingProviderFactory` decoupling business logic from third-party courier APIs (`FlashExpressProvider`, `KerryExpressProvider`, `TestShippingProvider`).
  2. Implement an explicit `ShipmentStateMachine` enforcing legal progression and synchronizing parent `Order.status` (`PROCESSING`, `READY_FOR_SHIPMENT`, `SHIPPED`, `DELIVERED`).
  3. Strictly enforce the **Payment Boundary**: `POST /api/v1/shipments` requires `order.status === PAYMENT_CONFIRMED` (or authorized COD). Unpaid `PENDING_PAYMENT` orders cannot be fulfilled.
- **Consequences:** Multi-carrier flexibility, elimination of fulfillment before payment, and reliable tracking status synchronization.

---

## ADR-038: Immutable Delivery Address Snapshotting & Stale Webhook Protection (Phase M8)
- **Status:** **APPROVED**
- **Context:** Customer address edits after dispatch must not alter historical shipment destination addresses. Courier tracking webhooks may arrive out-of-order or duplicate over public networks.
- **Decision:**
  1. Freeze delivery address at shipment creation time in both structured recipient columns and JSON `Shipment.addressSnapshot`. Future edits to `CustomerAddress` rows do not mutate historical shipments.
  2. Implement `isStaleEvent()` hierarchy ranking in `ShipmentStateMachine` to ensure late-arriving in-transit webhooks cannot downgrade a `DELIVERED` shipment.
  3. Implement composite unique constraint `@@unique([provider, eventId])` in `ShippingWebhookEvent` to safely deduplicate webhook replays with zero side effects.
  4. Maintain strict **Zero Stock Mutation Invariant** in Phase M8, completely isolating logistics tracking from inventory deduction (deferred to Phase M10).
- **Consequences:** Audit-safe address snapshots, zero webhook race condition hazards, and clean architectural separation from Phase M10 inventory reserves.

---

## ADR-039: Order Lifecycle State Machine, Cancellation Policy & Return Boundary (Phase M9)
- **Status:** **APPROVED**
- **Context:** Order management requires an authoritative lifecycle bridging Customer self-service, Admin/Staff operations, and logistics checkpoints without creating race conditions or unauthorized state jumps.
- **Decision:**
  1. Centralize all order state transitions within `OrderStateMachine`, defining explicit forward progression: `PENDING_PAYMENT` $\to$ `PAYMENT_CONFIRMED` $\to$ `PROCESSING` $\to$ `READY_FOR_SHIPMENT` $\to$ `SHIPPED` $\to$ `DELIVERED`, with side branches for `CANCELLED`, `RETURN_REQUESTED`, `RETURNED`, and `REFUNDED`.
  2. Implement customer cancellation policy: self-service cancellation is permitted only in `PENDING_PAYMENT`, `PAYMENT_CONFIRMED`, and `PROCESSING` prior to courier dispatch (`SHIPPED`/`IN_TRANSIT`). Once dispatched or delivered, cancellation is forbidden and customer must request an RMA return.
  3. Cancelling a paid order records refund eligibility in `OrderStatusHistory` without generating synthetic financial refunds; actual monetary movement remains strictly under M7 Payment Gateway authority (`PaymentService.refundPayment`).
  4. Returns (RMA) are restricted to `DELIVERED` orders, transitioning to `RETURN_REQUESTED` until reviewed by staff (`APPROVE` $\to$ `RETURNED`, `REJECT` $\to$ `DELIVERED`).
- **Consequences:** Eliminates illegal state mutations, guarantees financial refund safety, and provides clear operational boundaries for customer service.

---

## ADR-040: Cross-Domain Event Synchronization & Zero Stock Mutation Invariant in M9 (Phase M9)
- **Status:** **APPROVED**
- **Context:** Orders must reflect asynchronous events from Payment (M7) and Shipping (M8) while preserving complete boundary isolation from Phase M10 Inventory/Warehouse mutations.
- **Decision:**
  1. Implement synchronization helpers in `OrderStateMachine` (`resolveOrderStatusFromPayment`, `resolveOrderStatusFromShipment`) to automatically advance order lifecycle when payments confirm or couriers update delivery status.
  2. Synthesize unified, chronological Order Timelines on-demand by querying `OrderStatusHistory`, `PaymentEvent`, and `ShippingEvent` streams.
  3. Maintain strict **Zero Stock Mutation Invariant** in M9: no stock reservation, warehouse bin allocation, picking deduction, or `StockMovement` creation is permitted in Phase M9 (strictly preserved for Phase M10).
- **Consequences:** Real-time visibility across customer and staff portals, high audit transparency, and strict preservation of Phase M10 inventory boundaries.

---

## ADR-041: Authoritative Supplier & Purchase Order Lifecycle Design (Phase M11)
- **Status:** **APPROVED**
- **Context:** Supply-side procurement requires reliable master data management for vendors, supplier-specific SKU and cost mappings, multi-item purchase orders, and deterministic state progression across procurement operations.
- **Decision:**
  1. Implement server-authoritative `Supplier`, `SupplierProduct`, `PurchaseOrder`, and `PurchaseOrderItem` models.
  2. Implement an explicit, unidirectional state machine (`PurchaseOrderStateMachine`) enforcing legal progression: `DRAFT` $\to$ `PENDING_APPROVAL` $\to$ `APPROVED` $\to$ `SENT` $\to$ `PARTIALLY_RECEIVED` $\to$ `RECEIVED`, with terminal/exception states `REJECTED`, `CANCELLED`, and `CLOSED`.
  3. Snapshot purchasing unit costs, tax rates, and supplier SKUs at PO item creation time. Future supplier catalog or pricing changes do not mutate historical purchase orders.
- **Consequences:** Immutable procurement audit trail, deterministic state transitions, and elimination of price drift on historical purchase orders.

---

## ADR-042: Atomic Goods Receipt & M10 Inventory Integration Boundary (Phase M11)
- **Status:** **APPROVED**
- **Context:** Receiving goods from suppliers must increment warehouse on-hand stock and generate audit movements without bypassing or fragmenting M10's authoritative `InventoryService`.
- **Decision:**
  1. All goods receipt processing (`GoodsReceiptService.createGoodsReceipt`) runs within an ACID PostgreSQL transaction (`prisma.$transaction`).
  2. Enforce strict over-receiving invariants: total received quantity across all receipts for a PO item must satisfy $0 \le \text{receivedQty} \le \text{orderedQty}$.
  3. M11 mutates zero stock tables directly; it delegates all stock increments to `InventoryService.receiveStock(..., tx)` with row-level locking (`SELECT ... FOR UPDATE`), emitting `StockMovement` records with `movementType: PURCHASE_RECEIPT`.
- **Consequences:** 100% preservation of M10 inventory domain authority, atomic stock increments, complete ledger auditability, and immunity to race conditions or duplicate receiving.

---

## ADR-043: Four-Eyes Separation of Duties for Procurement Approval (Phase M11)
- **Status:** **APPROVED**
- **Context:** Internal procurement fraud and operational errors can occur if a single staff member can both create and approve high-value purchase orders without oversight.
- **Decision:**
  1. Enforce the Four-Eyes principle in `PurchaseOrderService.approvePO()`: a user cannot approve a Purchase Order they created (`createdBy === approverId` is rejected with `403 Forbidden`).
  2. `SUPER_ADMIN` users are permitted an audited override capability for small team operations, where self-approval is logged with explicit audit markers.
  3. Restrict PO submission, approval, sending, and receiving via server-authoritative RBAC (`SUPER_ADMIN`, `STORE_MANAGER`, `INVENTORY_CLERK`, `ACCOUNTANT`, `SALES_REP`, `CUSTOMER` — customer is rejected with 403 Forbidden).
- **Consequences:** Strong internal controls, governance alignment, and transparent audit logging for all procurement financial approvals.

---

## ADR-044: CRM Domain Boundary & Customer 360 Foundation (Phase M12)
- **Status:** **APPROVED**
- **Context:** Customer relationship management requires 360-degree customer profiling, tags, activity event tracking, and order frequency/LTV metrics without duplicating the canonical `User` identity or bypassing existing domain boundaries.
- **Decision:**
  1. Extend `CustomerProfile` as the single canonical customer domain root, maintaining a 1:1 relation with `User`.
  2. Derive customer lifetime value (LTV), order counts, and last purchase dates dynamically from authoritative `Order` records rather than maintaining unverified client-reported or stale cached counters.
  3. Implement an append-only, privacy-safe `CustomerActivity` stream for customer lifecycle events, strictly filtering internal audit traces from customer-facing self-service endpoints.
  4. Preserve domain isolation: M12 CRM never mutates payment records (M7), shipment states (M8), order state machine (M9), inventory balances (M10), or procurement documents (M11).
- **Consequences:** Unified customer visibility, zero identity fragmentation, robust IDOR protection, and strict domain boundary safety.

---

## ADR-045: Server-Authoritative Promotion, Coupon Concurrency & Stacking Policy (Phase M12)
- **Status:** **APPROVED**
- **Context:** Discount codes and marketing promotions are high-risk financial mechanisms susceptible to client-side price tampering, race conditions, expired redemptions, and unintended discount stacking.
- **Decision:**
  1. **Strict Server Authority:** The server alone computes line item qualifications, discount amounts, and order grand totals. Any client-submitted discount or grand total values are disregarded.
  2. **Concurrency Safety:** Coupon redemptions execute within ACID transactions (`prisma.$transaction`) with atomic usage limit checks (`usageCount < usageLimit` and per-customer limits). Simultaneous requests cannot over-redeem limited coupons.
  3. **Stacking Policy:** Enforce a single primary coupon/promotion per checkout transaction unless promotions explicitly declare `stackable: true`.
  4. **Historical Financial Immutability:** Order financial snapshots (`subtotal`, `discountTotal`, `shippingTotal`, `taxTotal`, `grandTotal`, line item snapshots, applied promo IDs) are frozen at checkout. Subsequent edits to or deletions of promotions never mutate historical invoices.
- **Consequences:** 100% immunity to discount tampering and race conditions, deterministic pricing, and permanent accounting audit integrity.

---

## ADR-046: Append-Only Loyalty Points Ledger & Compensating Reversal Model (Phase M12)
- **Status:** **APPROVED**
- **Context:** Customer loyalty programs require points earning on paid orders, points redemption during checkout, staff balance adjustments, and return/refund handling without balance corruption or historical ledger modification.
- **Decision:**
  1. Implement an append-only, single-stream points transaction ledger (`LoyaltyTransaction`) with transaction types `EARN`, `REDEEM`, `ADJUST`, `EXPIRE`, and `REFUND_REVERSAL`. Existing ledger entries are never updated or deleted.
  2. Enforce serializable transactional locking on `LoyaltyAccount` balance mutations, ensuring points balances cannot go below zero.
  3. **Order-Linked Earning:** Points are awarded idempotently upon reaching `PAYMENT_CONFIRMED` status, preventing duplicate earning on duplicate webhook/payment events.
  4. **Compensating Reversals:** Order cancellations or refunds generate explicit `REFUND_REVERSAL` or `ADJUST` compensating transactions restoring or debiting points, preserving complete financial audit trails.
  5. **Staff Governance:** Manual balance adjustments require mandatory actor ID, reason, and structured audit logs.
- **Consequences:** Zero negative balance race hazards, audit-compliant loyalty accounting, and clean synchronization with payment lifecycles.

---

## ADR-047: Deterministic Customer Segmentation & Lifecycle Event Streaming (Phase M12)
- **Status:** **APPROVED**
- **Context:** Marketing segmentation must target customer cohorts (e.g., `HIGH_VALUE`, `REPEAT_CUSTOMER`, `INACTIVE`, `GARAGE_PARTNERS`) based on deterministic rules rather than opaque or non-reproducible heuristic guesses.
- **Decision:**
  1. Implement a deterministic, explainable segment rule engine evaluating criteria against authoritative metrics (`order_count`, `lifetime_value`, `days_since_last_order`, `customer_type`) using formal relational comparison operators (`EQUALS`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, etc.).
  2. Provide both on-demand batch segment evaluation and event-driven re-evaluation hooks on order checkout and status progression.
  3. Marketing campaigns target structured `CustomerSegment` memberships, recording engagement and conversion events linked to authoritative orders for transparent ROI analytics.
- **Consequences:** Transparent, predictable customer segmentation, explainable audience targeting, and actionable campaign attribution.

