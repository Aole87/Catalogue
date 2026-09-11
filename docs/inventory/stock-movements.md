# Stock Movements & Append-Only Audit Ledger

## 1. Ledger Properties

The `StockMovement` table is an append-only transaction ledger.
- Existing records are never updated or deleted.
- Every row contains a complete balance snapshot before and after mutation.

## 2. Movement Types

| Movement Type | Description | onHand Effect | reserved Effect |
| :--- | :--- | :--- | :--- |
| `INITIAL_STOCK` | Initial physical count onboarding | $+$ | $0$ |
| `RESERVATION` | Stock hold for cart/checkout | $0$ | $+$ |
| `RELEASE` | Cancellation of hold | $0$ | $-$ |
| `DEDUCTION` | Fulfillment shipment dispatch | $-$ | $-$ |
| `ADJUSTMENT_IN` | Cycle count increase | $+$ | $0$ |
| `ADJUSTMENT_OUT`| Cycle count shrinkage/damage write-off | $-$ | $0$ |
| `TRANSFER_OUT` | Dual transaction source warehouse | $-$ | $0$ |
| `TRANSFER_IN` | Dual transaction target warehouse | $+$ | $0$ |
| `RETURN_RESTOCK`| Inspected customer return back to stock | $+$ | $0$ |
| `RETURN_DAMAGED`| Quarantined defective return | $0$ | $0$ |

## 3. Schema Fields

- `beforeOnHand` & `afterOnHand`
- `beforeReserved` & `afterReserved`
- `quantity` (positive magnitude)
- `performedByUserId` (staff or system actor)
- `referenceType` & `referenceId` (e.g. `TRF-...`, `ORDER-...`, `RESERVATION-...`)
- `notes` (mandatory audit explanation)
