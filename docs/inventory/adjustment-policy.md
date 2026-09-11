# Stock Adjustment & Return Disposition Policy

## 1. Stock Adjustment Directives

1. **Mandatory Audit Reason**:
   - Every adjustment must include an explicit reason string explaining the discrepancy (e.g., cycle count adjustment, damaged packaging write-off).
2. **Direction Enums**:
   - `INCREASE`: Adds units to `onHand`. Generates `ADJUSTMENT_IN` movement.
   - `DECREASE`: Removes units from `onHand`. Generates `ADJUSTMENT_OUT` movement. Cannot reduce `onHand` below current `reserved` stock.
   - `SET`: Sets `onHand` to an absolute quantity (must be $\ge reserved$).
3. **Role Authorization**:
   - Limited strictly to `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`, `INVENTORY_CLERK`, `WAREHOUSE`. Customers and Sales Reps are forbidden (`403 Forbidden`).

## 2. Return Disposition Workflow

When customer orders are returned (e.g. from M9 return requests):
- `RESTOCK`: Inspected goods in resellable condition are added back to `onHand` with a `RETURN_RESTOCK` movement ledger entry.
- `DAMAGED` / `QUARANTINE`: Damaged goods are isolated in quarantine and are NOT added to available saleable inventory.
