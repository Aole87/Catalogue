# Procurement Security, IDOR Protection & Audit Integrity

## 1. Overview

Procurement operations involve high-value financial commitments, supplier banking details, pricing agreements, and warehouse receiving.

This document outlines the security controls, IDOR mitigations, data sanitization, and audit logging standards implemented in Phase M11.

---

## 2. Threat Modeling & Safeguards

| Threat Vector | Risk Level | Mitigation Strategy |
|---|:---:|---|
| **Unauthorized Customer Access** | Critical | Server-side RBAC middleware (`requireRole`) rejects non-staff roles with `403 Forbidden` on every procurement route. |
| **Insecure Direct Object Reference (IDOR)** | High | All PO and GRN mutations verify user permissions against tenant/organization scopes. Draft PO updates verify ownership or elevated role. |
| **Price / Cost Tampering** | Critical | PO line item totals, taxes, and grand totals are calculated server-side using PostgreSQL `Decimal(12, 2)` types; client-provided totals are ignored. |
| **Over-Receiving / Stock Inflation** | High | Atomic receiving transactions enforce $0 \le \text{receivedQty} \le \text{orderedQty}$ per line item before emitting stock movements. |
| **Concurrent Receiving Race Conditions** | High | PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) lock target PO and item records during receipt processing. |
| **Supplier Code Injection / Spoofing** | Medium | Zod validation schemas strictly sanitize alphanumeric supplier codes, stripping unsafe characters and whitespace. |

---

## 3. Data Validation & Sanitization

All incoming payloads pass through strict Zod schemas before reaching the domain service layer:
- Alphanumeric code normalization (regex: `^[A-Za-z0-9\-_]+$`, converted to uppercase).
- Quantity constraints (integers $\ge 1$).
- Decimal validation with maximum precision $(12, 2)$.
- UUIDv4 regex validation on all entity IDs (`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`).

---

## 4. Audit Logging & Traceability

Every state change across the procurement lifecycle produces structured audit trails:
1. **Purchase Order History**:
   - `createdBy`, `createdAt`
   - `approvedBy`, `approvedAt` (with separation-of-duties audit flags)
   - `sentAt`
   - Rejection reasons and cancellation logs
2. **Goods Receipt History**:
   - `receivedBy`, `receivedAt`
   - `grnNumber`, `supplierDocNo`
   - Per-item `quantityAccepted`, `quantityRejected`, and inspection notes.
3. **M10 Stock Movements**:
   - Every received item appends a `StockMovement` row with `movementType: PURCHASE_RECEIPT` referencing the `GoodsReceipt` ID and PO number.
