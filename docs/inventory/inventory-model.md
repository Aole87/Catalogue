# Inventory Data Model & Invariants

## 1. Mathematical Invariants

Every inventory record must strictly satisfy the following invariants at all times:

1. **Non-Negative Stocks**:
   $$onHand \ge 0$$
   $$reserved \ge 0$$
2. **Reserved Boundary**:
   $$reserved \le onHand$$
3. **Saleable Availability**:
   $$available = onHand - reserved \ge 0$$
4. **Stock Classification Status**:
   - `OUT_OF_STOCK`: $available = 0$
   - `LOW_STOCK`: $0 < available \le reorderPoint$
   - `IN_STOCK`: $available > reorderPoint$

## 2. Model Structure

### `InventoryItem`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary key |
| `warehouseId` | UUID | Foreign key to `Warehouse` |
| `productId` | UUID | Foreign key to `Product` |
| `locationId` | UUID? | Optional specific bin location in warehouse |
| `onHand` | Integer | Total physical inventory count present in warehouse |
| `reserved` | Integer | Quantity allocated to active orders/holds |
| `safetyStock` | Integer | Minimum emergency reserve threshold |
| `reorderPoint` | Integer | Threshold triggering low-stock alert |
| `reorderQuantity`| Integer | Suggested replenishment batch size |

## 3. Row-Level Locking Pattern

To prevent race conditions during concurrent checkouts or adjustments:
```sql
SELECT id, on_hand, reserved 
FROM inventory_items 
WHERE warehouse_id = $1 AND product_id = $2 
FOR UPDATE;
```
Inside this transaction boundary, availability is checked and updated before releasing the lock.
