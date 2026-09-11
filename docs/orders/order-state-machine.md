# Order State Machine Specification

## 1. State Definitions

| State | Scope | Description | Terminal? |
|---|---|---|---|
| `DRAFT` | System | Initial checkout staging | No |
| `PENDING_PAYMENT` | Public / Customer | Order created, awaiting financial payment settlement | No |
| `PAYMENT_CONFIRMED` | Customer / Admin | Payment received and confirmed by M7 Payment Gateway | No |
| `PROCESSING` | Warehouse / Admin | Warehouse picking and packaging in progress | No |
| `READY_FOR_SHIPMENT` | Warehouse / Admin | Package packed, labeled, and awaiting carrier pickup | No |
| `SHIPPED` | Logistics / Customer | Dispatched with carrier (in-transit / out for delivery) | No |
| `DELIVERED` | Customer / Admin | Parcel successfully handed over to customer | No |
| `CANCELLED` | Terminal | Order cancelled by customer or staff | Yes |
| `RETURN_REQUESTED` | Customer / Admin | Customer submitted RMA return request | No |
| `RETURNED` | Warehouse / Admin | Returned items inspected and accepted at warehouse | No |
| `REFUNDED` | Financial / Admin | Financial refund processed under M7 authority | Yes |

## 2. Allowed State Transitions Matrix

```typescript
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  PENDING_PAYMENT: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.CANCELLED],
  PAYMENT_CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.READY_FOR_SHIPMENT, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.READY_FOR_SHIPMENT, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  READY_FOR_SHIPMENT: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED, OrderStatus.RETURN_REQUESTED, OrderStatus.CANCELLED],
  DELIVERED: [OrderStatus.RETURN_REQUESTED, OrderStatus.REFUNDED],
  RETURN_REQUESTED: [OrderStatus.RETURNED, OrderStatus.DELIVERED, OrderStatus.REFUNDED],
  RETURNED: [OrderStatus.REFUNDED],
  CANCELLED: [OrderStatus.REFUNDED],
  REFUNDED: [],
};
```

## 3. Idempotency & Validation Rules
- **Idempotency:** A transition from status $S \to S$ is treated as an idempotent no-op and returns 200 without creating redundant history entries.
- **Illegal Transitions:** Any transition not explicitly listed in the matrix throws `BadRequestException` (`400 Bad Request`).
- **Terminal States:** Orders in `CANCELLED` or `REFUNDED` cannot be transitioned back to active fulfillment states (`PROCESSING`, `SHIPPED`, etc.).
