# Supplier Master Data Management

## 1. Overview

The Supplier domain manages master vendor records, credit terms, tax identification, contact details, and operational status.

Suppliers supply automotive parts, raw materials, fluids, and accessories to the business.

---

## 2. Supplier Data Model

```prisma
model Supplier {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code            String            @unique @db.VarChar(50)
  name            String            @db.VarChar(255)
  contactName     String?           @map("contact_name") @db.VarChar(255)
  email           String?           @db.VarChar(255)
  phone           String?           @db.VarChar(50)
  taxId           String?           @map("tax_id") @db.VarChar(50)
  address         String?           @db.Text
  paymentTerms    String?           @default("NET30") @map("payment_terms") @db.VarChar(50)
  leadTimeDays    Int?              @default(7) @map("lead_time_days")
  currency        String            @default("THB") @db.VarChar(10)
  isActive        Boolean           @default(true) @map("is_active")
  rating          Decimal?          @db.Decimal(3, 2)
  notes           String?           @db.Text
  createdAt       DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime          @updatedAt @map("updated_at") @db.Timestamptz

  supplierProducts SupplierProduct[]
  purchaseOrders   PurchaseOrder[]

  @@index([name])
  @@index([isActive])
  @@map("suppliers")
}
```

---

## 3. Business Rules & Validations

1. **Normalized Unique Supplier Code**:
   - Supplier codes are normalized to uppercase and trimmed (e.g., `SUP-BOSCH-01`).
   - Duplicate codes are rejected with `409 Conflict`.

2. **Payment Terms Standard**:
   - Supported terms include `NET15`, `NET30`, `NET60`, `NET90`, `COD` (Cash on Delivery), `PIA` (Payment in Advance).
   - Defaults to `NET30` if unspecified.

3. **Soft-Delete & Inactive Protection**:
   - Inactive suppliers (`isActive: false`) cannot be selected for new Purchase Orders or new product mappings.
   - Deleting a supplier with existing historical Purchase Orders performs a soft inactivation rather than a hard cascade delete, maintaining historical audit integrity.

4. **Audit Trail**:
   - All supplier updates (name changes, address changes, rating adjustments) record timestamped modifications.

---

## 4. API Endpoints

### 1. List Suppliers
- **Endpoint**: `GET /api/v1/suppliers`
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `search` (matches code, name, contactName, email)
  - `isActive` (boolean filter)
- **Response**: Paginated array of suppliers.

### 2. Get Supplier by ID
- **Endpoint**: `GET /api/v1/suppliers/:id`
- **Response**: Supplier details including active product mapping counts and recent PO counts.

### 3. Create Supplier
- **Endpoint**: `POST /api/v1/suppliers`
- **RBAC**: `SUPER_ADMIN`, `STORE_MANAGER`
- **Payload**:
  ```json
  {
    "code": "SUP-BOSCH-TH",
    "name": "Robert Bosch Automotive (Thailand) Co., Ltd.",
    "contactName": "Somchai Jaidee",
    "email": "orders.th@bosch.com",
    "phone": "+6621234567",
    "taxId": "0105550012345",
    "paymentTerms": "NET30",
    "leadTimeDays": 5,
    "currency": "THB",
    "address": "123 Wireless Road, Lumpini, Pathumwan, Bangkok 10330"
  }
  ```

### 4. Update Supplier
- **Endpoint**: `PUT /api/v1/suppliers/:id`
- **RBAC**: `SUPER_ADMIN`, `STORE_MANAGER`

### 5. Delete / Inactivate Supplier
- **Endpoint**: `DELETE /api/v1/suppliers/:id`
- **RBAC**: `SUPER_ADMIN`
