# Brand Domain Architecture

## 1. Overview & Data Model

The **Brand Domain** represents component manufacturers, OEM suppliers, and aftermarket performance brands (e.g. *Akebono, TRW, Brembo, Denso, Bosch, NGK, Mobil 1, Aisin, Sakura*).

```prisma
model Brand {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String    @unique
  slug        String    @unique
  description String?
  logoUrl     String?   @map("logo_url")
  websiteUrl  String?   @map("website_url")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  products        Product[]
  crossReferences ProductCrossReference[]

  @@map("brands")
}
```

---

## 2. Integrity & Deletion Rules

1. **Unique Identity:** Both `name` (case-insensitive) and `slug` are strictly unique across active brands.
2. **Product Association Safety:** Deleting a brand that has active catalog products assigned is rejected with `409 Conflict`.
3. **Audit Logging:** All brand creations, updates, and deletions are recorded in the `audit_logs` ledger.

---

## 3. API Endpoints

| Endpoint | Method | Auth / Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/brands` | `GET` | Public | List all active brands |
| `/api/v1/brands/:id` | `GET` | Public | Get brand details by UUID |
| `/api/v1/brands/slug/:slug` | `GET` | Public | Get brand details by URL-safe slug |
| `/api/v1/admin/brands` | `GET` | `brand.read` | List all brands including inactive ones |
| `/api/v1/admin/brands` | `POST` | `brand.create` | Create a new manufacturer/brand |
| `/api/v1/admin/brands/:id` | `PATCH` | `brand.update` | Update brand details |
| `/api/v1/admin/brands/:id` | `DELETE` | `brand.delete` | Soft-delete brand with product safety check |
