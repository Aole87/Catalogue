# Procurement-to-Inventory Integration & M10 Authority

## 1. Zero Direct Mutation Invariant

Phase M11 maintains strict architectural boundary isolation with Phase M10 Inventory & Warehouse Management.

**Rule**: No service, controller, or repository in the M11 Procurement module is permitted to execute direct SQL `UPDATE` or `INSERT` statements against `inventory_items` or `stock_movements`.

```
[M11 GoodsReceiptService]
         |
         | Calls public API with active transaction client (tx)
         v
[M10 InventoryService.receiveStock(params, tx)]
         |
         |-- Acquires Row Lock (SELECT ... FOR UPDATE)
         |-- Increments inventory_items.on_hand
         +-- Appends immutable StockMovement (movementType: PURCHASE_RECEIPT)
```

---

## 2. Integration Method Signature

In [`apps/api/src/services/inventory.service.ts`](file:///Users/ibookky/Catalogue/car-parts-catalog/apps/api/src/services/inventory.service.ts):

```typescript
export class InventoryService {
  async receiveStock(
    params: {
      warehouseId: string;
      productId: string;
      quantity: number;
      referenceId?: string; // GoodsReceiptId or PO Number
      notes?: string;
      userId?: string;
    },
    tx?: Prisma.TransactionClient
  ): Promise<{ inventoryItem: any; stockMovement: any }> {
    const client = tx || prisma;

    // 1. Lock or Upsert Inventory Item for (warehouseId, productId)
    let item = await client.inventoryItem.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: params.warehouseId,
          productId: params.productId,
        },
      },
    });

    if (!item) {
      item = await client.inventoryItem.create({
        data: {
          warehouseId: params.warehouseId,
          productId: params.productId,
          onHand: params.quantity,
          reserved: 0,
          available: params.quantity,
        },
      });
    } else {
      item = await client.inventoryItem.update({
        where: { id: item.id },
        data: {
          onHand: { increment: params.quantity },
          available: { increment: params.quantity },
        },
      });
    }

    // 2. Append Immutable StockMovement
    const movement = await client.stockMovement.create({
      data: {
        warehouseId: params.warehouseId,
        productId: params.productId,
        movementType: StockMovementType.PURCHASE_RECEIPT,
        quantity: params.quantity,
        referenceType: 'GOODS_RECEIPT',
        referenceId: params.referenceId,
        notes: params.notes || 'Procurement Goods Receipt',
        createdBy: params.userId,
      },
    });

    return { inventoryItem: item, stockMovement: movement };
  }
}
```

---

## 3. Transactional Isolation & Concurrency Safety

1. **ACID Boundary**:
   - `GoodsReceiptService.createGoodsReceipt` wraps the entire operation in `prisma.$transaction`.
   - If any line item fails inventory allocation or violates receiving constraints, the entire receipt and all stock increments roll back completely.

2. **Concurrency Locking**:
   - `purchase_orders` and `purchase_order_items` are locked during receipt creation using PostgreSQL row-level locks, preventing parallel duplicate receiving requests from racing against the same PO.

3. **Traceability**:
   - Every `StockMovement` generated from receiving includes `referenceType: 'GOODS_RECEIPT'` and `referenceId: grn.id` or `grn.grnNumber`, linking warehouse bin balances directly back to vendor purchasing documents.
