# Goods Receipt & Receiving Workflow

## 1. Overview

The Goods Receipt domain (`GoodsReceipt` and `GoodsReceiptItem`) tracks the physical arrival and inspection of purchased parts from suppliers into warehouse facilities.

It supports:
- Full order receipts.
- Partial shipments across multiple delivery batches.
- Damaged / rejected item tracking.
- Strict over-receiving validation ($0 \le \text{receivedQty} \le \text{orderedQty}$).
- Integration with M10 Warehouse & Inventory on-hand balances.

---

## 2. Goods Receipt Data Model

```prisma
model GoodsReceipt {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  grnNumber       String    @unique @map("grn_number") @db.VarChar(50)
  purchaseOrderId String    @map("purchase_order_id") @db.Uuid
  warehouseId     String    @map("warehouse_id") @db.Uuid
  receivedBy      String    @map("received_by") @db.Uuid
  receivedAt      DateTime  @default(now()) @map("received_at") @db.Timestamptz
  supplierDocNo   String?   @map("supplier_doc_no") @db.VarChar(100)
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz

  purchaseOrder  PurchaseOrder      @relation(fields: [purchaseOrderId], references: [id])
  warehouse      Warehouse          @relation(fields: [warehouseId], references: [id])
  receivedByUser User               @relation("GRNReceivedByUser", fields: [receivedBy], references: [id])
  items          GoodsReceiptItem[]

  @@index([purchaseOrderId])
  @@index([warehouseId])
  @@index([grnNumber])
  @@map("goods_receipts")
}

model GoodsReceiptItem {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  goodsReceiptId   String   @map("goods_receipt_id") @db.Uuid
  productId        String   @map("product_id") @db.Uuid
  quantityAccepted Int      @map("quantity_accepted")
  quantityRejected Int      @default(0) @map("quantity_rejected")
  unitCost         Decimal  @map("unit_cost") @db.Decimal(12, 2)
  notes            String?  @db.Text
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime @updatedAt @map("updated_at") @db.Timestamptz

  goodsReceipt GoodsReceipt @relation(fields: [goodsReceiptId], references: [id], onDelete: Cascade)
  product      Product      @relation(fields: [productId], references: [id])

  @@index([productId])
  @@map("goods_receipt_items")
}
```

---

## 3. Goods Receipt Number Generation

Goods Receipt Note numbers follow the enterprise sequence format: `GRN-YYYYMMDD-XXXXX`
- `YYYYMMDD`: UTC Date
- `XXXXX`: Zero-padded 5-digit daily sequence.
- Example: `GRN-20260910-00001`

---

## 4. Partial & Full Receiving Invariants

1. **Eligible PO Status**:
   - Receipts can only be created for Purchase Orders in `SENT` or `PARTIALLY_RECEIVED` status.
   - Creating a receipt for `DRAFT`, `PENDING_APPROVAL`, `CANCELLED`, or `CLOSED` POs is blocked.

2. **Over-Receiving Protection**:
   - For every line item:
     $$\text{totalReceived} = \text{previouslyReceived} + \text{quantityAccepted}$$
     $$\text{totalReceived} \le \text{orderedQuantity}$$
   - Any attempt to accept more units than originally ordered throws `400 Bad Request` with `OVER_RECEIVING_NOT_ALLOWED`.

3. **Automatic PO Status Advancement**:
   - If $\sum \text{receivedQuantity} < \sum \text{orderedQuantity}$, the PO status is set to `PARTIALLY_RECEIVED`.
   - If $\forall \text{items}, \text{receivedQuantity} == \text{orderedQuantity}$, the PO status is set to `RECEIVED`.

4. **Rejected Stock Handling**:
   - Damaged, defective, or incorrect parts are recorded in `quantityRejected`.
   - Rejected quantities are logged for vendor performance scoring but **never** increment on-hand inventory balances.
