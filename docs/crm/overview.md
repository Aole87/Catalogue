# CRM Domain Architecture & Customer 360 Foundation

## 1. Domain Objective
The Customer Relationship Management (CRM) domain in Phase M12 establishes an authoritative Customer 360 foundation, allowing operations and sales teams to understand customer behavior, track engagement timelines, calculate customer lifetime value (LTV), assign custom tags, and segment customers for targeted promotions.

## 2. Entity Model
- **`CustomerProfile`**: 1:1 linked with `User`, storing B2B/B2C attributes (`customerType: CUSTOMER | GARAGE | SHOP`, `companyName`, `taxId`, `phone`, `notes`).
- **`CustomerTag` & `CustomerTagAssignment`**: Flexible taxonomy for tagging customers (e.g. "VIP Workshop", "Wholesale Buyer", "High Return Risk").
- **`CustomerSegment` & `CustomerSegmentMembership`**: Cohort groupings dynamically evaluated via deterministic rule engine.
- **`CustomerActivity`**: Append-only event stream tracking lifecycle milestones (`ACCOUNT_CREATED`, `PROFILE_UPDATED`, `ORDER_CREATED`, `ORDER_PAID`, `ORDER_SHIPPED`, `COUPON_REDEEMED`, `LOYALTY_EARNED`, `LOYALTY_REDEEMED`).

## 3. Dynamic Authoritative Metrics
Customer LTV, order counts, and purchase frequencies are derived dynamically from authoritative `Order` records:
- `orderCount`: Count of non-cancelled orders.
- `lifetimeValue`: Sum of `grandTotal` across valid completed orders.
- `lastOrderDate`: Timestamp of most recent order.
- `daysSinceLastOrder`: Calendar days elapsed since last purchase.

## 4. RBAC & Security Boundary
- **Customer Self-Service (`/api/v1/customers/me`)**: Restricted strictly to authenticated user's own profile with zero IDOR vulnerability. Internal audit records and staff notes are masked.
- **Staff Access (`/api/v1/admin/customers/*`)**: Authorized for `SUPER_ADMIN`, `STORE_MANAGER`, and `SALES_REP`. Unauthorized roles receive `403 Forbidden`.
- **Domain Boundaries**: M12 CRM does not mutate payment state (M7), shipment state (M8), order lifecycle (M9), inventory stock (M10), or supplier purchase orders (M11).
