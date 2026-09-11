# System Overview

## 1. Product Vision
**Intelligent Automotive E-Commerce & Business Management Platform**

The platform is designed for a single-merchant automotive parts business in Thailand targeting **THB 2,000,000+ / month** in revenue. It supports both B2C (end consumers) and B2B customers (Garages/อู่ซ่อมรถ and Auto Shops/ร้านค้าอะไหล่) with tier-based pricing.

> **Key Business Principle:** This is a **single-merchant** platform (NOT a marketplace). There are no external sellers, seller registrations, vendor commissions, or multi-vendor order splits. However, domain boundaries are cleanly decoupled to allow future evolution.

---

## 2. Core User Experience
> **"Tell us what car you drive, and the system helps you find the correct parts."**

Vehicle compatibility (fitment) is the central core capability.
- **Rule of Fitment:** The system must **never** allow AI or semantic search to override authoritative structured fitment data.
- **Tiered Pricing:** Dynamic prices based on customer segment:
  - `General`: Retail consumer price
  - `Shop`: Auto parts store wholesale price
  - `Garage`: Professional mechanic / workshop price

---

## 3. High-Level Architecture Flow

```
CUSTOMER (Web & Mobile Browser / App)
    │
    ▼
FRONT OFFICE / E-COMMERCE
├── Vehicle Selector (Garage / YMM / VIN)
├── Fast Catalog Search & Faceted Filtering
├── Authoritative Fitment Engine
├── AI Parts Advisor (Guided Consultation)
├── Cart & Multi-tier Pricing
├── Checkout & Address Management
├── Payment Gateway (PromptPay, Credit Card, Bank Transfer)
└── Order Tracking & Invoices
    │
    ▼
COMMERCE & BUSINESS ENGINE (API Layer)
├── Authentication & Session Management
├── Authoritative Pricing & Fitment Resolution
├── Inventory Reservation & Multi-Warehouse Stock
├── Order State Machine & Fulfillment Lifecycle
├── Purchasing & Supplier Management
└── Marketing, Loyalty & Promotion Engine
    │
    ▼
BACK OFFICE (Admin Portal)
├── Product & Master Catalog Management
├── Dynamic Vehicle Compatibility Matrix (Fitment)
├── Multi-Warehouse Inventory & Replenishment
├── Purchase Orders & Supplier Records
├── Orders, Invoicing & Returns (RMA)
├── B2B Customer Verification & Tier Management
├── CRM & Customer Communications
├── Promotions, Coupons & Loyalty Points
├── Analytics, Sales Reporting & Executive Dashboard
└── RBAC, Security Permissions & Tamper-evident Audit Logs
    │
    ▼
DATA TIER (PostgreSQL + Prisma)
```

---

## 4. Architectural Tenets & Development Rules

1. **Rule 1 — Database is Authoritative:** Prices, inventory, discounts, compatibility, shipping, and order totals are calculated and verified server-side. Frontend client inputs are never trusted for business rules.
2. **Rule 2 — Fitment is Deterministic:** Structured fitment data is the single source of truth. AI assists discovery and natural language understanding but cannot invent or alter compatibility.
3. **Rule 3 — Financial Operations are Transactional:** Orders, payment updates, refunds, and stock mutations execute within atomic database transactions (ACID).
4. **Rule 4 — Inventory Cannot Oversell:** Stock management uses strict reservations and atomic decrement logic to prevent race conditions.
5. **Rule 5 — Orders are Immutable Snapshots:** Order items preserve immutable snapshots of product name, SKU, unit price, applied discounts, tax, and specifications at time of purchase.
6. **Rule 6 — APIs are Versioned:** All client-facing endpoints follow `/api/v1/...` standard conventions.
7. **Rule 7 — Authorization is Server-Side:** Frontend route guards provide UX routing only; every API request is strictly verified by server-side RBAC middleware.
8. **Rule 8 — No Fake Functionality:** Features are not marked complete when backed only by UI mockups, client-side arrays, or placeholder logic.
9. **Rule 9 — Comprehensive Feature Lifecycle:** Every production feature encompasses Database, Backend Service, Validated API, Frontend UI, Loading/Empty states, Error Handling, and Automated Tests.
10. **Rule 10 — Preserve Working Functionality:** Modernize incrementally through vertical slices without breaking working user workflows.
