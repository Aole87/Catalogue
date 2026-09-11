# Order Management & API Reference

## 1. Customer Endpoints

### `GET /api/v1/orders/my-orders`
- **Auth:** Customer session cookie / token.
- **Query Params:** `page`, `limit` (max 100), `status`, `q`, `dateFrom`, `dateTo`.
- **Response:** `{ data: Order[], pagination: { page, limit, total, totalPages } }`.

### `GET /api/v1/orders/:id`
- **Auth:** Owner customer or staff. IDOR protected.
- **Response:** `{ data: OrderDetail }`.

### `GET /api/v1/orders/by-number/:orderNumber`
- **Auth:** Public / Customer order lookup.
- **Security:**
  - **Authenticated Owner:** Returns full order details and item snapshots.
  - **Authenticated Non-Owner:** Rejected with `403 Forbidden` (cross-tenant IDOR protection).
  - **Unauthenticated / Guest:** Returns a sanitized public projection with strict PII masking (`isPublicConfirmation: true`, masked recipient name, masked phone `081-***-5678`, masked email `s***@***.com`, masked street address, and complete removal of internal customer notes, admin notes, payment slips, and audit logs).
- **Response:** `{ data: OrderDetail | PublicOrderConfirmation }`.

### `GET /api/v1/orders/:id/timeline`
- **Auth:** Owner customer or staff (unauthenticated queries receive public timeline events with staff notes stripped).
- **Response:** `{ data: TimelineEvent[] }` synthesized chronologically from `OrderStatusHistory`, `PaymentEvent`, and `ShippingEvent`.

### `POST /api/v1/orders/:id/cancel`
- **Auth:** Owner customer.
- **Body:** `{ reason: string }`.

### `POST /api/v1/orders/:id/return`
- **Auth:** Owner customer.
- **Body:** `{ reason: string, notes?: string }`.

---

## 2. Staff & Admin Endpoints

### `GET /api/v1/admin/orders`
- **RBAC:** `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`, `SALES_REP`, `ACCOUNTANT`, `INVENTORY_CLERK`, `WAREHOUSE`.
- **Query Params:** `q`, `status`, `paymentStatus`, `shipmentStatus`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`, `page`, `limit` (capped at 100).

### `GET /api/v1/admin/orders/:id`
- **RBAC:** `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`, `SALES_REP`, `ACCOUNTANT`, `INVENTORY_CLERK`, `WAREHOUSE`.
- **Response:** `{ data: OrderDetail }`.

### `PATCH /api/v1/admin/orders/:id/status`
- **RBAC:** `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`, `INVENTORY_CLERK`, `WAREHOUSE`.
- **Body:** `{ toStatus: OrderStatus, note?: string }`.
- **State Machine:** Validates transition against `OrderStateMachine`; illegal transitions rejected with `400 Bad Request`.

### `POST /api/v1/admin/orders/:id/cancel`
- **RBAC:** `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`, `SALES_REP`.
- **Body:** `{ reason: string }`.

### `POST /api/v1/admin/orders/:id/return-action`
- **RBAC:** `SUPER_ADMIN`, `ADMIN`, `STORE_MANAGER`, `INVENTORY_CLERK`, `WAREHOUSE`.
- **Body:** `{ action: "APPROVE" | "REJECT", note?: string }`.
