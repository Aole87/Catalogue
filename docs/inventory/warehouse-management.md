# Warehouse & Bin Location Management

## 1. Multi-Warehouse Hierarchy

The warehouse structure supports distributed operations across multiple regional logistics centers.

```
Warehouse (e.g. WH-MAIN, WH-BRANCH-2)
  ├── Location / Bin (Zone A, Rack 01, Shelf 02, Bin 03) -> Code: LOC-A01-02-03
  ├── Location / Bin (Zone B, Rack 04, Shelf 01, Bin 01) -> Code: LOC-B04-01-01
  └── Inventory Items (SKU-123 in WH-MAIN)
```

## 2. Constraints & Soft-Deletion

1. **Unique Location Identifier**:
   - Location codes must be unique per warehouse (`@@unique([warehouseId, code])`).
2. **Active Stock Deletion Guard**:
   - A warehouse cannot be soft-deleted if any associated `InventoryItem` has $onHand > 0$ or $reserved > 0$.
3. **Location Assignment**:
   - Products stored in a warehouse can optionally point to a primary bin coordinate (`locationId`).

## 3. Warehouse REST Endpoints

- `GET /api/v1/warehouses`: List all active warehouses.
- `POST /api/v1/warehouses`: Create warehouse (Restricted to `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`).
- `PATCH /api/v1/warehouses/:id`: Update warehouse metadata.
- `DELETE /api/v1/warehouses/:id`: Soft-delete warehouse if zero active stock.
- `GET /api/v1/warehouses/:id/locations`: List bin locations in warehouse.
- `POST /api/v1/warehouses/:id/locations`: Create new location coordinate.
