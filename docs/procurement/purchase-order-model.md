# Purchase Order Data Model & Financial Snapshots

## 1. Overview

The `PurchaseOrder` and `PurchaseOrderItem` models record formal purchase commitments to vendors.

To comply with accounting audit requirements and Thai tax regulations, purchasing unit costs, taxes, supplier SKUs, and item descriptions are immutable snapshots frozen at PO creation.

---

## 2. Relational Schema

```prisma
enum PurchaseOrderStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  SENT
  PARTIALLY_RECEIVED
  RECEIVED
  CANCELLED
  CLOSED
}

model PurchaseOrder {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  poNumber        String              @unique @map("po_number") @db.VarChar(50)
  supplierId      String              @map("supplier_id") @db.Uuid
  warehouseId     String?             @map("warehouse_id") @db.Uuid
  status          PurchaseOrderStatus @default(DRAFT)
  subtotal        Decimal             @default(0) @db.Decimal(12, 2)
  taxRate         Decimal             @default(7.00) @map("tax_rate") @db.Decimal(5, 2)
  taxAmount       Decimal             @default(0) @map("tax_amount") @db.Decimal(12, 2)
  shippingCost    Decimal             @default(0) @map("shipping_cost") @db.Decimal(12, 2)
  totalAmount     Decimal             @default(0) @map("total_amount") @db.Decimal(12, 2)
  currency        String              @default("THB") @db.VarChar(10)
  paymentTerms    String?             @map("payment_terms") @db.VarChar(50)
  expectedDate    DateTime?           @map("expected_date") @db.Timestamptz
  notes           String?             @db.Text
  rejectionReason String?             @map("rejection_reason") @db.Text
  createdBy       String              @map("created_by") @db.Uuid
  approvedBy      String?             @map("approved_by") @db.Uuid
  approvedAt      DateTime?           @map("approved_at") @db.Timestamptz
  sentAt          DateTime?           @map("sent_at") @db.Timestamptz
  createdAt       DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime            @updatedAt @map("updated_at") @db.Timestamptz

  supplier      Supplier            @relation(fields: [supplierId], references: [id])
  warehouse     Warehouse?          @relation(fields: [warehouseId], references: [id])
  createdByUser User                @relation("POCreatedByUser", fields: [createdBy], references: [id])
  approvedByUser User?              @relation("POApprovedByUser", fields: [approvedBy], references: [id])
  items         PurchaseOrderItem[]
  goodsReceipts GoodsReceipt[]

  @@index([supplierId])
  @@index([status])
  @@index([poNumber])
  @@index([createdAt])
  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  purchaseOrderId  String   @map("purchase_order_id") @db.Uuid
  productId        String   @map("product_id") @db.Uuid
  supplierSku      String?  @map("supplier_sku") @db.VarChar(100)
  orderedQuantity  Int      @map("ordered_quantity")
  receivedQuantity Int      @default(0) @map("received_quantity")
  unitCost         Decimal  @map("unit_cost") @db.Decimal(12, 2)
  lineTotal        Decimal  @map("line_total") @db.Decimal(12, 2)
  notes            String?  @db.Text
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime @updatedAt @map("updated_at") @db.Timestamptz

  purchaseOrder PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  product       Product       @relation(fields: [productId], references: [id])

  @@unique([purchaseOrderId, productId])
  @@index([productId])
  @@map("purchase_order_items")
}
```

---

## 3. Monetary & Financial Calculations

All calculations utilize exact PostgreSQL `Decimal(12, 2)` arithmetic to prevent IEEE-754 floating-point drift:

$$\text{Line Total} = \text{orderedQuantity} \times \text{unitCost}$$

$$\text{Subtotal} = \sum \text{Line Total}$$

$$\text{Tax Amount} = \text{round}\left(\text{Subtotal} \times \frac{\text{taxRate}}{100}, 2\right)$$

$$\text{Total Amount} = \text{Subtotal} + \text{Tax Amount} + \text{shippingCost}$$

---

## 4. PO Number Generation

PO Numbers follow the enterprise sequence format: `PO-YYYYMMDD-XXXXX`
- `YYYYMMDD`: UTC Date
- `XXXXX`: Zero-padded 5-digit daily sequence from atomic database counting.
- Example: `PO-20260910-00001`
