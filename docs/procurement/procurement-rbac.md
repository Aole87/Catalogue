# Procurement RBAC & Permission Matrix

## 1. Overview

Access to procurement operations is strictly governed by server-authoritative Role-Based Access Control (RBAC).

Storefront customers, guests, and unauthenticated users are barred from all procurement resources.

---

## 2. Role-to-Operation Permission Matrix

| Operation | HTTP Endpoint | SUPER_ADMIN | STORE_MANAGER | INVENTORY_CLERK | ACCOUNTANT | SALES_REP | CUSTOMER |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **List Suppliers** | `GET /suppliers` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 403 |
| **View Supplier Details** | `GET /suppliers/:id` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 403 |
| **Create Supplier** | `POST /suppliers` | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| **Update Supplier** | `PUT /suppliers/:id` | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| **Delete Supplier** | `DELETE /suppliers/:id` | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| **Manage Supplier Products** | `POST/PUT/DEL /suppliers/:id/products` | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| **List Purchase Orders** | `GET /purchase-orders` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 403 |
| **View PO Details** | `GET /purchase-orders/:id` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 403 |
| **Create PO Draft** | `POST /purchase-orders` | ✅ | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 |
| **Edit PO Draft** | `PUT /purchase-orders/:id` | ✅ | ✅ | ✅ (Own) | ❌ 403 | ❌ 403 | ❌ 403 |
| **Submit PO for Approval** | `POST /purchase-orders/:id/submit` | ✅ | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 |
| **Approve / Reject PO** | `POST /purchase-orders/:id/approve` | ✅ (Override) | ✅ (4-Eyes) | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| **Send PO to Supplier** | `POST /purchase-orders/:id/send` | ✅ | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 |
| **Cancel PO** | `POST /purchase-orders/:id/cancel` | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 |
| **Create Goods Receipt** | `POST /goods-receipts` | ✅ | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 403 |
| **List Goods Receipts** | `GET /goods-receipts` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 403 |
| **View Goods Receipt** | `GET /goods-receipts/:id` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ 403 |

---

## 3. Four-Eyes Separation of Duties Rules

```
Scenario 1: Standard Workflow
- Clerk creates PO #101 (createdBy: Clerk_ID).
- Clerk attempts to approve PO #101 -> 403 FORBIDDEN (Cannot approve own PO).
- Manager approves PO #101 -> 200 OK.

Scenario 2: Manager Workflow
- Manager creates PO #102 (createdBy: Manager_ID).
- Manager attempts to approve PO #102 -> 403 FORBIDDEN (Separation of Duties violated).
- Another Manager or Super Admin approves PO #102 -> 200 OK.

Scenario 3: Super Admin Emergency Override
- Super Admin creates PO #103 (createdBy: SuperAdmin_ID).
- Super Admin approves PO #103 -> 200 OK with explicit audit log entry.
```
