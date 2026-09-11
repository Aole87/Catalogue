# Shipping & Fulfillment Architecture (Phase M8)

## 1. Executive Summary
Phase M8 implements the **Shipping Integration & Fulfillment Workflow** for the Intelligent Automotive E-Commerce platform (`iBookky/Autoparts-Data`).

The shipping subsystem bridges confirmed financial orders (`PAYMENT_CONFIRMED` / `COD`) with physical logistics couriers (Flash Express, Kerry Express, SCG Express, Lalamove), providing immutable address snapshots, strict state machine transitions, append-only checkpoint tracking, out-of-order webhook protection, and customer tracking UX.

---

## 2. Architectural Boundaries & Non-Goals

```mermaid
graph TD
    A["Order Confirmation (M7: PAID)"] -->|Payment Boundary Enforced| B["Shipment Creation (M8)"]
    B --> C["Address Snapshotting (Frozen JSON)"]
    B --> D["Warehouse Fulfillment Workflow (Staff RBAC)"]
    D --> E["Carrier Tracking Number Assignment"]
    E --> F["Carrier Webhook Ingestion (HMAC-SHA256)"]
    F --> G["Stale Event Protection (No Downgrades)"]
    G --> H["Customer Tracking UX & Events Timeline"]
    
    style B fill:#e0f2fe,stroke:#0284c7,stroke-width:2px
    style D fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style F fill:#dcfce7,stroke:#16a34a,stroke-width:2px
```

### Critical Boundaries
1. **Strict Payment Boundary:**
   - Orders in status `PENDING_PAYMENT` cannot enter fulfillment.
   - `POST /api/v1/shipments` explicitly checks `order.status in [PAYMENT_CONFIRMED, PROCESSING, READY_FOR_SHIPMENT, SHIPPED, DELIVERED]` or authorized COD.
2. **Zero Inventory / Warehouse Stock Mutation:**
   - M8 does NOT reserve, allocate, deduct, or mutate warehouse stock quantities in `InventoryItem` or ledger movements in `StockMovement`.
   - Inventory reservation, bin allocation, pick-and-pack routing, and batch deduction are strictly deferred to **Phase M10 (Inventory & Warehouse Management)**.
3. **Zero Historical Financial Mutation:**
   - Fulfillment operations never alter order financial values (`subtotal`, `grandTotal`, `shippingTotal`, `OrderItem.unitPrice`).
   - Shipping rates are resolved server-side from `ShippingMethod.basePrice`.

---

## 3. Database Domain Models

```mermaid
erDiagram
    ORDER ||--o{ SHIPMENT : "has"
    SHIPPING_METHOD ||--o{ SHIPMENT : "specifies"
    SHIPMENT ||--o{ SHIPPING_EVENT : "logs checkpoints"
    USER ||--o{ SHIPPING_EVENT : "audits action"
    SHIPPING_WEBHOOK_EVENT ||--|| SHIPMENT : "deduplicates"

    SHIPMENT {
        uuid id PK
        string shipmentNumber UK
        uuid orderId FK
        uuid shippingMethodId FK
        string carrier
        string serviceLevel
        string trackingNumber
        enum status
        decimal shippingCost
        string currency
        string recipientName
        string phone
        string addressLine1
        string addressLine2
        string subdistrict
        string district
        string province
        string postalCode
        string country
        jsonb addressSnapshot
        timestamp estimatedDelivery
        timestamp shippedAt
        timestamp deliveredAt
        timestamp createdAt
        timestamp updatedAt
    }

    SHIPPING_EVENT {
        uuid id PK
        uuid shipmentId FK
        enum status
        string description
        string location
        string providerEventId
        uuid actorId FK
        timestamp occurredAt
        timestamp receivedAt
        jsonb metadata
    }

    SHIPPING_WEBHOOK_EVENT {
        uuid id PK
        string provider
        string eventId
        string eventType
        jsonb payload
        string status
        timestamp processedAt
        timestamp createdAt
    }
```

---

## 4. Security & Privacy Controls
1. **IDOR Protection:**
   - Customers can only query shipments belonging to their own customer profile (`order.customerId === user.customerProfile.id`).
   - Cross-tenant shipment queries return `403 Forbidden`.
2. **Public Tracking Privacy Masking:**
   - Unauthenticated customer tracking lookup (`GET /api/v1/tracking/:trackingNumber`) masks recipient names (e.g., `Somchai S.`) and phone numbers (`081-XXX-5678`).
3. **Webhook Cryptographic Authentication:**
   - Carrier webhooks require valid `HMAC-SHA256` signatures verified via timing-safe byte comparison (`crypto.timingSafeEqual`).
4. **Replay & Timestamp Protection:**
   - Timestamp headers exceeding 300 seconds skew are rejected.
   - Provider event IDs are recorded with `@@unique([provider, eventId])` to safely absorb webhook re-deliveries.
