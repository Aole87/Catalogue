# Target Domain Mapping & Gap Analysis

## 1. Domain Mapping Matrix

| Domain | Existing Implementation | Target Capability | Gap Description | Priority |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | Plaintext query in SQLite | Argon2, JWT / HttpOnly session cookies, OAuth / OTP | No password hashing, no tokens, no session lifecycle | **P0** |
| **RBAC** | Unused `permissions` column | Granular roles (Superadmin, Inventory Manager, Sales, Customer) | No server-side permission checks or role hierarchy | **P0** |
| **Products** | Basic SQLite CRUD with JSON specs | Master SKU, multi-spec, brand/category associations, assets | Missing structured attributes, dimensional data, weight, unit of measure | **P0** |
| **Categories** | Flat / Single-level category table | Multi-level category taxonomy tree with URL slugs | No hierarchical parent-child relationships or slugging | **P0** |
| **Brands** | Name & logo image | Part manufacturer profiles, tier ratings, warranty policies | Basic table only; missing manufacturer metadata | **P1** |
| **Vehicles** | Flat `car_brands`, `car_models`, `car_years` | Normalized Year-Make-Model-Engine-Trim (YMMET) hierarchy | Missing engine, transmission, body, generation models | **P0** |
| **Fitment** | Loose strings in `products` table | Deterministic, relational `product_fitments` with position/notes | No many-to-many fitment matrix or position constraints | **P0** |
| **Search** | Client-side filter / SQL `LIKE %q%` | PostgreSQL `pg_trgm`, Full-Text Search, OEM cross-reference lookup | Slow, unindexed substring matching without typo tolerance | **P0** |
| **AI (Parts Advisor)**| Absent | LLM consultation agent with strict fitment verification tools | Completely missing | **P2** |
| **Cart** | Absent | Persistent B2C/B2B shopping carts with tier price resolution | Completely missing | **P0** |
| **Checkout** | Absent | Multi-step checkout with Thai shipping & billing calculation | Completely missing | **P0** |
| **Orders** | Absent | Immutable order snapshot, status state machine, PDF tax invoice | Completely missing | **P0** |
| **Payments** | Absent | PromptPay QR generation, Credit Cards, Slip upload verification | Completely missing | **P0** |
| **Shipping** | Absent | Courier rate computation, parcel tracking (Kerry/Flash/SCG) | Completely missing | **P1** |
| **Inventory** | Absent | Multi-warehouse stock levels, reorder points, batch movements | Completely missing | **P0** |
| **Warehouse** | Absent | Warehouse locations, bin/shelf locations, transfer orders | Completely missing | **P1** |
| **Purchasing** | Absent | Purchase orders, PO item lifecycle, receiving inspection | Completely missing | **P1** |
| **Suppliers** | Absent | Supplier master records, vendor part numbers, terms | Completely missing | **P1** |
| **Customers** | Simple `users` table with business type | Customer profiles, tax invoice details, address book, garage profiles | Missing verification workflows, addresses, credit limits | **P1** |
| **CRM** | Absent | Customer order history, garage consultation notes, ticket logs | Completely missing | **P2** |
| **Promotions** | Absent | Tiered discounts, volume discounts, category promos | Completely missing | **P1** |
| **Coupons** | Absent | Promo code validation, usage limits, minimum spend rules | Completely missing | **P2** |
| **Loyalty** | Absent | Garage rewards points, cashback balance, tier upgrades | Completely missing | **P2** |
| **Reviews** | Star rating UI in mock data | Verified buyer product reviews with photo uploads & moderation | Completely missing (UI mock only) | **P2** |
| **Marketing** | Promo banners in UI | Abandoned cart recovery, Line Notify / SMS alerts | Completely missing | **P3** |
| **CMS** | Hardcoded banners & category icons | Dynamic banner manager, homepage layout builder, FAQ/articles | Hardcoded in React source | **P2** |
| **SEO** | Static meta tags in `index.html` | Dynamic OpenGraph, JSON-LD structured data (Product, AutoParts) | Minimal static tags only | **P1** |
| **Analytics** | Basic `analytics` table (unused) | Sales dashboard, conversion tracking, fitment search telemetry | Mock dashboard metrics only | **P1** |
| **Notifications** | Absent | Email, Line Notify, SMS order updates, low-stock alerts | Completely missing | **P1** |
| **Audit Logs** | Absent | Immutable audit log table recording all administrative mutations | Completely missing | **P0** |

---

## 2. Priority Definitions
- **P0 (Critical Foundation):** Must be established in M1–M3 to enable core transactional e-commerce (Database, Auth, Products, Fitment, Inventory, Orders, Payments, Cart).
- **P1 (Core Business Capabilities):** Required to run daily commercial operations (Suppliers, Purchasing, Warehouses, Customer Verification, B2B Terms, Notifications, Shipping).
- **P2 (Important Enhancements):** Advanced business features (AI Parts Advisor, Loyalty Points, Reviews, Promotions/Coupons, CMS).
- **P3 (Future Enhancements):** Marketing automation, advanced telemetry, marketplace readiness decoupling.
