# Current State Architecture & Baseline Audit

## 1. Executive Summary
The existing codebase is a hybrid **Electron Desktop Application + React Single-Page Application (SPA)** built with Vite, Tailwind CSS (via CDN), and an embedded SQLite database (`database.sqlite`).

The frontend features a modern, responsive UI design ("FlatLab" inspired) with basic customer catalog browsing, vehicle selection filtering, tier-based price display, and an administrative dashboard with entity CRUD and Excel/CSV product import.

However, the current architecture lacks a server-side API layer, relies on client-constructed raw SQL queries piped over Electron IPC, uses plain-text passwords without authentication tokens, and lacks order processing, checkout, inventory management, or transactional guarantees.

---

## 2. Current Technology Stack

| Layer | Discovered Technology | Version / Specification | Notes / Risks |
| :--- | :--- | :--- | :--- |
| **Language** | JavaScript (ES6+ / CommonJS) | Node.js ecosystem | No TypeScript; no static type safety |
| **Frontend Framework** | React | `^19.2.7` | Client-side SPA using state-based router |
| **Build Tooling** | Vite | `^8.0.16` | Fast HMR and bundle compilation |
| **Styling** | Tailwind CSS + Custom CSS | CDN script + `src/index.css` | CDN dependency; FlatLab palette |
| **Desktop Wrapper** | Electron | `^42.3.3` | Houses local SQLite DB & IPC handler |
| **Database** | SQLite 3 (`sqlite3` / `sqlite`) | `^6.0.1` / `^5.1.1` | Local file `database.sqlite` |
| **ORM / Querying** | Direct Raw SQL Queries | Embedded SQL in JSX | No ORM; no query builder |
| **Icons & UI Helpers** | `lucide-react`, `clsx`, `tailwind-merge` | `^1.17.0`, `^2.1.1`, `^3.6.0` | UI utility icons and class merging |
| **Testing** | None | N/A | No test runners or test files exist |
| **CI / CD & Docker** | None | N/A | No containerization or automated pipelines |

---

## 3. Directory & File Inventory

```
car-parts-catalog/
├── .gitignore              # Ignores node_modules only (database & dist are tracked)
├── database.sqlite         # Local SQLite DB instance
├── index.html              # Entry HTML loading Tailwind CDN
├── main.js                 # Electron main process (DB initialization & IPC handler)
├── package.json            # Project manifest & dependency list
├── preload.js              # Electron IPC bridge exposing window.electronAPI
├── schema.sql              # Initial SQLite DDL schema
├── seed.js                 # Database seed script for initial dummy data
├── tailwind.config.js      # Color tokens & theme definition
├── vite.config.js          # Vite config with React plugin & path aliases
└── src/
    ├── App.jsx             # Root component with state-based navigation
    ├── index.css           # Global stylesheet & FlatLab class definitions
    ├── main.jsx            # React root mount point
    ├── assets/             # Bundled promo images (mobil1, tools, battery)
    └── pages/
        ├── Home.jsx            # Customer portal, vehicle selector, category grid
        ├── ProductList.jsx     # Search, faceted filtering, product grid
        ├── ProductDetail.jsx   # Product info, cross-references, tier pricing
        ├── Login.jsx           # User authentication form
        ├── Register.jsx        # User registration form with business type
        └── AdminDashboard.jsx  # Admin back-office (CRUD, Product manager, Excel import)
```

---

## 4. Module Implementation Audit

| Module / Component | Discovered File | Implementation Status | Detailed Evaluation |
| :--- | :--- | :--- | :--- |
| **Customer Home Portal** | `src/pages/Home.jsx` | **PARTIAL** | Functional vehicle selector UI (Make, Model, Year). Category grid (30 items) and promo sliders work. Engine/Trim/VIN filters are UI placeholders. Uses hardcoded mock fallback when running outside Electron. |
| **Catalog & Product Search**| `src/pages/ProductList.jsx`| **PARTIAL** | Working vehicle filter, category sidebar, brand filter, and keyword search. Tiered price display works. Cross-reference search is basic `code LIKE %?%`. |
| **Product Detail** | `src/pages/ProductDetail.jsx`| **PARTIAL** | Displays specs, OEM code, cross-references list, and dynamic price by `user.business_type`. "Add to Cart" is replaced with contact notice. |
| **Authentication & Auth** | `src/pages/Login.jsx`, `Register.jsx` | **BROKEN / INSECURE** | Raw plain-text password query (`WHERE email = ? AND password = ?`). No hashing, JWT, session, or CSRF protection. Web mode logs in with dummy mock data without checking credentials. |
| **Admin Overview** | `src/pages/AdminDashboard.jsx` | **PROTOTYPE** | Row counts (`SELECT COUNT(*)`) work. Revenue cards and chart widgets are static hardcoded placeholders. |
| **Admin Entity CRUD** | `src/pages/AdminDashboard.jsx` | **PARTIAL** | CRUD for Categories, Brands, Car Brands, Car Years, Members, Admins works via Electron IPC. Direct table name interpolation introduces SQL injection risk. Fails in pure web mode. |
| **Admin Product Manager** | `src/pages/AdminDashboard.jsx` | **PARTIAL** | Full form for adding/editing products with tier prices, JSON specs, and base64 image uploads. Pagination is basic limit/offset. No inventory tracking. |
| **Excel / CSV Importer** | `src/pages/AdminDashboard.jsx` | **PARTIAL** | Parses CSV/TSV natively or XLSX via dynamically injected CDN script (`SheetJS`). Auto-maps headers and creates missing categories/brands. Sequential row-by-row queries without batch transactions. |
| **Cart & Checkout** | N/A | **OBSOLETE / MISSING** | Completely absent. |
| **Payment & Invoicing** | N/A | **OBSOLETE / MISSING** | Completely absent. |
| **Inventory & Warehouse**| N/A | **OBSOLETE / MISSING** | Completely absent. No stock quantity columns exist. |
| **Purchasing & Suppliers**| N/A | **OBSOLETE / MISSING** | Completely absent. |
| **AI Parts Advisor** | N/A | **OBSOLETE / MISSING** | Completely absent. |
| **Audit Logs & RBAC** | N/A | **OBSOLETE / MISSING** | Admins table exists with a unused `permissions` column. No audit log table or RBAC engine. |

---

## 5. Existing Database Schema Analysis (SQLite)

```sql
admins (id, username, password, role, permissions)
categories (id, name, image_url)
brands (id, name, image_url)
car_brands (id, name, image_url)
car_models (id, name, car_brand_id)
car_years (id, year)
products (id, name, code, description, category_id, brand_id, car_brand, car_model, car_year, price_garage, price_shop, price_general, images, specifications, cross_references)
users (id, first_name, last_name, phone, business_name, business_type, email, password, is_verified, is_active, created_at)
analytics (id, user_id, target_type, target_id, timestamp)
```

### Key Database Shortcomings
1. **Denormalized Vehicle Fitment:** Products store vehicle compatibility as loose strings (`car_brand`, `car_model`, `car_year`) rather than relational foreign keys or a dedicated many-to-many `product_fitments` table.
2. **Missing Inventory & Orders:** No tables for warehouses, stock levels, stock movements, purchase orders, customer carts, orders, order items, payments, or shipments.
3. **No Soft Deletes or Audit Trail:** No `deleted_at`, `updated_at`, or change tracking.
4. **Heavy Base64 Bloat:** Product images and category thumbnails are stored as raw base64 data URIs inside SQLite TEXT columns, causing rapid database file bloat.
