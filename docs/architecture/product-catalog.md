# Product Catalog Domain Architecture

## 1. Overview & System Boundary

The **Product Catalog Domain** serves as the authoritative source of truth for all automotive parts, master SKUs, specifications, pricing tiers, and cross-references within the platform.

All product mutations and queries flow through the typed Fastify API server (`/api/v1`), backed by **PostgreSQL 16** and **Prisma ORM**. Direct database access or legacy Electron SQL IPC (`window.electronAPI.query`) is strictly bypassed for all Product Catalog operations.

```
Storefront / Admin Client
           │
           │ HTTPS / Cookie & Bearer Credentials
           ▼
┌────────────────────────────────────────────────────────┐
│ Fastify API Server (/api/v1)                           │
│                                                        │
│  [ Authorization & Guards ]                            │
│   ├── authenticateOptional (Storefront Public Read)    │
│   └── requirePermission (Admin Product Mutation)       │
│                                                        │
│  [ Product Services & Business Rules ]                 │
│   ├── SKU / Slug Uniqueness Enforcement                │
│   ├── Server-Authoritative Tiered Price Resolution     │
│   ├── PostgreSQL pg_trgm Search Normalization          │
│   └── Append-Only Audit Logging                        │
│                                                        │
│  [ Transactional Persistence Layer ]                   │
│   ├── ProductRepository.$transaction                   │
│   └── PostgreSQL 16 (Decimal(12,2), JSON Specs)        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
                   PostgreSQL 16 Engine
```

---

## 2. Product Relational Model

```
┌────────────────────────────────────────────────────────────────┐
│                            Product                             │
│  id: UUID (PK)                                                 │
│  sku: VARCHAR(100) (Unique)                                    │
│  slug: VARCHAR(150) (Unique)                                   │
│  name: VARCHAR(255)                                            │
│  shortDescription, description, barcode, warrantyText          │
│  weightGrams, lengthMm, widthMm, heightMm                      │
│  brandId: UUID (FK -> Brand)                                   │
│  categoryId: UUID (FK -> Category)                             │
│  isActive: Boolean, isPublished: Boolean                       │
│  createdAt, updatedAt, deletedAt                               │
└───────┬──────────────┬──────────────┬──────────────┬───────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌────────────────┐
│ ProductPrice ││ ProductImage ││ AttributeVal ││ CrossReference │
│ tier (Enum)  ││ url (URL)    ││ attributeId  ││ referenceType  │
│ price: Dec   ││ isPrimary    ││ value        ││ refNumber      │
│ compareAtDec ││ sortOrder    │└──────────────┘│ brandId        │
└──────────────┘└──────────────┘                └────────────────┘
```

---

## 3. Server-Authoritative Tiered Pricing (Gate C)

1. **Pricing Tiers:**
   - `GENERAL`: B2C Retail consumers.
   - `GARAGE`: B2B automotive repair workshops.
   - `SHOP`: B2B auto parts retail stores.
2. **Monetary Precision:** Stored exclusively using PostgreSQL `Decimal(12, 2)` (never floating point). Serialized in API responses as 2-decimal strings (e.g. `"1599.50"`).
3. **Dynamic User Resolution:** The API server resolves the caller's session on every request; if the authenticated user has an approved B2B profile (`GARAGE` or `SHOP`), their negotiated tier price is automatically returned in `effectivePrice`. Unauthenticated and retail users receive `GENERAL`.

---

## 4. Product Listing, Pagination, Filters & Search

### Pagination Standard
- Default: `page=1, pageSize=20`
- Maximum `pageSize` is clamped to `100` to prevent unindexed table scans.
- Metadata response format:
  ```json
  {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 245,
      "totalPages": 13
    }
  }
  ```

### Whitelist Sorting
- Supported sort keys: `name`, `price`, `sku`, `createdAt`, `updatedAt` (orders: `asc` or `desc`).
- Arbitrary SQL fragments in query parameters are strictly blocked by Zod schemas.

### PostgreSQL Native Keyword Search
- Matches across product `name`, `sku`, `slug`, `description`, brand `name`, category `name`, and OEM cross-reference `referenceNumber`.
- Compatible with Thai text, English part names, and uppercase OEM identifiers.

---

## 5. API Endpoints

| Endpoint | Method | Auth / Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/products` | `GET` | Public (Optional Auth) | List published products with pagination, filters, sorting, and search |
| `/api/v1/products/:id` | `GET` | Public (Optional Auth) | Get product detail by UUID with authoritative user tier price |
| `/api/v1/products/slug/:slug` | `GET` | Public (Optional Auth) | Get product detail by URL-safe slug |
| `/api/v1/admin/products` | `GET` | `product.read` | List all products including inactive and unpublished items |
| `/api/v1/admin/products/:id` | `GET` | `product.read` | Get administrative product detail with all pricing tiers |
| `/api/v1/admin/products` | `POST` | `product.create` | Atomically create product with prices, images, attributes, cross-refs |
| `/api/v1/admin/products/:id` | `PATCH` | `product.update` | Update product fields, prices, attributes, or images |
| `/api/v1/admin/products/:id` | `DELETE` | `product.delete` | Soft-delete product from active catalog |
| `/api/v1/admin/products/:id/prices` | `PUT` | `pricing.manage` | Update or upsert pricing tiers with Decimal precision |
