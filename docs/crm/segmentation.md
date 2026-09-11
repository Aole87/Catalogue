# Deterministic Customer Segmentation Engine

## 1. Segmentation Philosophy
Phase M12 enforces **100% deterministic, explainable rule evaluation**. AI/LLM guesswork is strictly prohibited from classifying customer financial or operational segments.

## 2. Rule Evaluation Architecture
Each `CustomerSegment` can configure multiple `CustomerSegmentRule` records evaluated conjunctively (logical `AND`).

### Supported Evaluated Fields:
- `order_count` / `orders`: Total count of valid customer orders.
- `lifetime_value` / `ltv`: Cumulative order monetary value (THB).
- `days_since_last_order`: Days since the customer's most recent order.
- `customer_type`: Customer taxonomy tier (`CUSTOMER`, `GARAGE`, `SHOP`).

### Supported Comparison Operators:
- `EQUALS` ($=$)
- `NOT_EQUALS` ($\neq$)
- `GREATER_THAN` ($>$)
- `GREATER_THAN_OR_EQUAL` ($\ge$)
- `LESS_THAN` ($<$)
- `LESS_THAN_OR_EQUAL` ($\le$)
- `CONTAINS` (substring match)

## 3. Evaluation Triggers
1. **On-Demand Evaluation**: `POST /api/v1/admin/customers/segments/:id/evaluate` scans all active profiles and atomically synchronizes `CustomerSegmentMembership` records.
2. **Lifecycle Event Evaluation**: Upon order checkout (`ORDER_CREATED`) or payment confirmation (`ORDER_PAID`), the customer's membership across all `isAutomatic: true` segments is automatically recalculated.
