# Supplier-Product Mapping & Purchasing Constraints

## 1. Overview

In the automotive aftermarket, a single internal product (Master SKU) can be procured from multiple vendors at different costs, minimum order quantities (MOQ), and packaging units.

The `SupplierProduct` domain manages:
- Supplier-specific SKU and part numbers (e.g., Bosch 0 986 AB1 234 vs Denso 456-7890).
- Unit purchasing costs in PostgreSQL `Decimal(12, 2)`.
- Minimum Order Quantity (MOQ) and Pack Size constraints.
- Lead time in days.
- Single-preferred supplier designation per internal product.

---

## 2. SupplierProduct Data Model

```prisma
model SupplierProduct {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  supplierId      String   @map("supplier_id") @db.Uuid
  productId       String   @map("product_id") @db.Uuid
  supplierSku     String?  @map("supplier_sku") @db.VarChar(100)
  costPrice       Decimal  @map("cost_price") @db.Decimal(12, 2)
  currency        String   @default("THB") @db.VarChar(10)
  moq             Int      @default(1)
  packSize        Int      @default(1) @map("pack_size")
  leadTimeDays    Int?     @map("lead_time_days")
  isPreferred     Boolean  @default(false) @map("is_preferred")
  isActive        Boolean  @default(true) @map("is_active")
  notes           String?  @db.Text
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz

  supplier Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  product  Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([supplierId, productId])
  @@index([supplierSku])
  @@index([productId])
  @@index([supplierId])
  @@map("supplier_products")
}
```

---

## 3. Key Invariants & Rules

1. **Unique Mapping Constraint**:
   - A supplier can only be mapped to a given product once (`@@unique([supplierId, productId])`).

2. **Single Preferred Supplier Rule**:
   - When a mapping is designated as preferred (`isPreferred: true`), all other supplier mappings for that same `productId` automatically have `isPreferred` set to `false` within an atomic transaction.
   - This ensures deterministic automated reordering and default vendor selection.

3. **Strict Monetary & Constraint Validation**:
   - `costPrice` must be strictly positive ($> 0$).
   - `moq` must be $\ge 1$.
   - `packSize` must be $\ge 1$.
   - `leadTimeDays` must be $\ge 0$.

4. **Product Existence & Inactive Protection**:
   - Mappings can only be established against active `Product` and active `Supplier` entities.

---

## 4. API Endpoints

### 1. List Product Mappings for Supplier
- **Endpoint**: `GET /api/v1/suppliers/:supplierId/products`
- **Response**: List of mapped products with costs, MOQs, preferred flags, and product details.

### 2. Create or Upsert Supplier-Product Mapping
- **Endpoint**: `POST /api/v1/suppliers/:supplierId/products`
- **RBAC**: `SUPER_ADMIN`, `STORE_MANAGER`
- **Payload**:
  ```json
  {
    "productId": "8a32d1e2-...",
    "supplierSku": "BOSCH-BP-0012",
    "costPrice": 450.00,
    "currency": "THB",
    "moq": 10,
    "packSize": 5,
    "leadTimeDays": 3,
    "isPreferred": true
  }
  ```

### 3. Update Mapping
- **Endpoint**: `PUT /api/v1/suppliers/:supplierId/products/:productId`
- **RBAC**: `SUPER_ADMIN`, `STORE_MANAGER`

### 4. Delete Mapping
- **Endpoint**: `DELETE /api/v1/suppliers/:supplierId/products/:productId`
- **RBAC**: `SUPER_ADMIN`, `STORE_MANAGER`
