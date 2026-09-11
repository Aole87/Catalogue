# Role-Based & Permission-Based Access Control (RBAC)

## 1. Overview & Data Model

Authorization in the platform is enforced strictly on the server using a multi-tiered **Role-Based and Permission-Based Access Control (RBAC)** architecture.

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     User     │◄───────►│   UserRole   │◄───────►│     Role     │
└──────────────┘         └──────────────┘         └──────────────┘
                                                         ▲
                                                         │
                                                  ┌──────────────┐
                                                  │RolePermission│
                                                  └──────────────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │  Permission  │
                                                  └──────────────┘
```

### Relational Schema
- **`users`:** Individual user accounts (`id`, `email`, `isActive`, etc.).
- **`user_roles`:** Many-to-many junction assigning roles to users.
- **`roles`:** Named system roles (`SUPER_ADMIN`, `STORE_MANAGER`, `SALES_REP`, `INVENTORY_CLERK`, `ACCOUNTANT`, `CUSTOMER`).
- **`role_permissions`:** Many-to-many junction assigning permissions to roles.
- **`permissions`:** Granular capabilities defined by `resource` and `action` (e.g., `product:create`, `order:approve`, `user:manage`).

---

## 2. Standard System Roles

| Role Name | Scope | Description |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Global System | Full administrative access across all business domains, system configuration, user management, and audit logs. |
| `STORE_MANAGER` | Store Operations | Product catalog editing, pricing management, campaign configuration, order fulfillment oversight. |
| `SALES_REP` | Sales & Quotes | Customer management, quotation generation, B2B price tier consultation, order tracking. |
| `INVENTORY_CLERK`| Warehouse | Warehouse stock management, receiving purchase orders, inventory counts, stock movement tracking. |
| `ACCOUNTANT` | Financials | Invoicing, payment reconciliation, credit term adjustments, financial reporting. |
| `CUSTOMER` | Consumer / B2B | Personal account profile, vehicle garage management, shopping cart, order placement, order history. |

---

## 3. Granular Permission Naming Convention

Permissions are structured using dot notation: `<resource>.<action>`

### Examples:
- `product.create`, `product.read`, `product.update`, `product.delete`
- `category.manage`
- `brand.manage`
- `inventory.read`, `inventory.adjust`
- `order.create`, `order.read`, `order.update`, `order.cancel`
- `customer.manage`
- `user.manage`
- `admin.access`

---

## 4. Reusable Fastify Middleware Guards

Authorization is enforced declaratively at the route level via reusable Fastify `preHandler` hooks.

### Guard 1: `authenticate`
Verifies the caller is signed in with a valid, non-expired, non-revoked session.
- **Failure:** Returns HTTP `401 Unauthorized` with code `AUTH_UNAUTHORIZED`.

```typescript
import { authenticate } from '../middleware/auth';

app.get('/api/v1/profile', {
  preHandler: [authenticate],
  handler: async (request, reply) => {
    return { user: request.user };
  },
});
```

### Guard 2: `requireRole(...roleNames)`
Ensures the caller is authenticated AND possesses at least one of the specified roles.
- **Unauthenticated:** Returns HTTP `401 Unauthorized`.
- **Insufficient Role:** Returns HTTP `403 Forbidden` with code `FORBIDDEN`.

```typescript
import { requireRole } from '../middleware/auth';

app.get('/api/v1/admin/dashboard', {
  preHandler: [requireRole('SUPER_ADMIN', 'STORE_MANAGER')],
  handler: async (request, reply) => {
    return { data: 'admin-metrics' };
  },
});
```

### Guard 3: `requirePermission(...permissionNames)`
Ensures the caller possesses specific granular permissions aggregated from all of their assigned roles (`SUPER_ADMIN` automatically bypasses granular checks).
- **Unauthenticated:** Returns HTTP `401 Unauthorized`.
- **Insufficient Permission:** Returns HTTP `403 Forbidden` with code `FORBIDDEN`.

```typescript
import { requirePermission } from '../middleware/auth';

app.post('/api/v1/products', {
  preHandler: [requirePermission('product.create')],
  handler: async (request, reply) => {
    // Controller logic
  },
});
```

---

## 5. Client Self-Assignment Prevention

Clients cannot elevate privileges:
- Registration endpoints (`POST /api/v1/auth/register`) hardcode assignment to the `CUSTOMER` role.
- User management and role assignment APIs (future phase) are guarded with `SUPER_ADMIN` / `user.manage` permissions.
- All authorization decisions are verified against the PostgreSQL database on every request, eliminating client-side privilege spoofing.
