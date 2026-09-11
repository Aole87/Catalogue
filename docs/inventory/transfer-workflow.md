# Inter-Warehouse Stock Transfer Workflow

## 1. Transfer Workflow Overview

Transfers move stock between two distinct warehouses within an atomic PostgreSQL transaction.

```
Source Warehouse                               Target Warehouse
(WH-MAIN)                                     (WH-BRANCH-2)
    │                                              │
    ├── 1. Lock source row & verify available      │
    ├── 2. Deduct onHand (-Q)                      │
    ├── 3. Write StockMovement (TRANSFER_OUT)      │
    │      Ref: TRF-12345678                       │
    │                                              ├── 4. Lock/upsert target row
    │                                              ├── 5. Increment onHand (+Q)
    │                                              └── 6. Write StockMovement (TRANSFER_IN)
    │                                                     Ref: TRF-12345678
```

## 2. Guarantees & Safeguards

1. **Atomicity**:
   - If either source deduction or destination increment fails, the entire transaction rolls back.
2. **Anti-Negative Stock**:
   - Source warehouse must satisfy $available \ge quantity$.
3. **Audit Reference Coupling**:
   - Both movement records share identical `TRF-...` reference IDs for end-to-end reconciliation.
4. **Distinct Warehouse Validation**:
   - Source and target warehouse cannot be identical unless moving between different locations within the same warehouse.
