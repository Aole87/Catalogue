# API Architecture

## 1. Overview & System Boundary

The **Autoparts API Server** serves as the authoritative, secure backend boundary for all automotive e-commerce operations. Built with **Node.js, TypeScript, and Fastify**, the API strictly decouples client interfaces (such as the React storefront and administrative portals) from direct database interactions.

```
React Storefront / Admin Portal
           │
           │ HTTPS / Cookie & Bearer Credentials
           ▼
┌─────────────────────────────────────────────────────────┐
│ Fastify API Server (/api/v1)                            │
│                                                         │
│  [ Plugins & Global Hooks ]                             │
│   ├── Request ID Generation (UUIDv4)                    │
│   ├── Helmet (Security Headers)                         │
│   ├── CORS (Strict Allowed Origins)                     │
│   ├── Fastify Cookie (Signed/Encrypted)                 │
│   ├── Rate Limiting (In-Memory / Route Specific)        │
│   └── Centralized Error Handler                         │
│                                                         │
│  [ Layered Execution Flow ]                             │
│   ├── Routes (/api/v1/auth, /health, etc.)              │
│   ├── Controllers (HTTP Request / Response Formatting)  │
│   ├── Services / Use Cases (Business Logic & Workflow)  │
│   ├── Authorization Middleware (RBAC & Permissions)     │
│   ├── Repositories (Data Access Layer)                  │
│   └── Prisma Client (Type-Safe Query Construction)      │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
                    PostgreSQL 16 Engine
```

### Authoritative Boundary Rule
The client interface is strictly untrusted:
- **Authentication:** Sessions and identity are validated on the server on every request.
- **Authorization:** Permissions and roles are checked against active database records.
- **Prices & Inventory:** Calculated and reserved purely via server-side database transactions.
- **No Arbitrary SQL:** The API exposes explicit, strictly typed REST endpoints; arbitrary SQL endpoints are prohibited.

---

## 2. Directory & Component Structure

The API server resides under `apps/api/` with strict layered separation of concerns:

```
apps/api/
├── src/
│   ├── config/
│   │   └── env.ts               # Validated Zod configuration from process.env
│   ├── errors/
│   │   ├── app-error.ts         # Domain exception classes (Unauthorized, Forbidden, etc.)
│   │   └── error-handler.ts     # Global error filter producing standardized responses
│   ├── logging/
│   │   └── logger.ts            # Pino structured logger with credential redaction
│   ├── security/
│   │   ├── password.ts          # Argon2id password hashing & verification
│   │   └── tokens.ts            # Cryptographic random token generation & SHA-256 hashing
│   ├── schemas/
│   │   └── auth.schema.ts       # Zod runtime input validation schemas
│   ├── repositories/
│   │   ├── user.repository.ts   # User data access layer
│   │   ├── session.repository.ts# Session persistence and revocation queries
│   │   └── role.repository.ts   # Role and permission resolution queries
│   ├── services/
│   │   └── auth.service.ts      # Authentication business use cases
│   ├── controllers/
│   │   ├── auth.controller.ts   # HTTP request parsing & cookie handling
│   │   └── health.controller.ts # Liveness and database readiness probes
│   ├── middleware/
│   │   └── auth.ts              # authenticate, requireRole, requirePermission hooks
│   ├── plugins/
│   │   └── swagger.ts           # OpenAPI 3.0 / Swagger UI documentation
│   ├── routes/
│   │   ├── auth.routes.ts       # /api/v1/auth routes
│   │   └── health.routes.ts     # /health and /ready routes
│   ├── app.ts                   # Fastify application builder & plugin registration
│   └── server.ts                # Server entrypoint and lifecycle bootstrapper
```

---

## 3. API Versioning & Route Conventions

All business API endpoints are grouped under the `/api/v1` namespace. Health and readiness endpoints are exposed both at root and within the versioned namespace.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Public | Liveness probe (process uptime, timestamp) |
| `/ready` | `GET` | Public | Readiness probe (PostgreSQL database connectivity check) |
| `/api/v1/health` | `GET` | Public | Versioned alias for liveness check |
| `/api/v1/auth/register` | `POST` | Public (Rate Limited) | Register a consumer account (`CUSTOMER` role) and start a session |
| `/api/v1/auth/login` | `POST` | Public (Rate Limited) | Authenticate user credentials and issue an `HttpOnly` session cookie |
| `/api/v1/auth/logout` | `POST` | Authenticated | Invalidate active session and clear cookie |
| `/api/v1/auth/me` | `GET` | Authenticated | Retrieve current user profile, assigned roles, and permission list |
| `/api/v1/auth/change-password` | `POST` | Authenticated (Rate Limited) | Change password and revoke all other active sessions |
| `/api/v1/products` | `GET` | Public / Tier-Aware | List published products with vehicle, category, brand, and text filters |
| `/api/v1/products/:idOrSlug` | `GET` | Public / Tier-Aware | Get product details, pricing, attributes, cross-references, and fitments |
| `/api/v1/products/:productId/fitment/:vehicleVariantId` | `GET` | Public | Authoritative deterministic fitment check with reason code |
| `/api/v1/products/:productId/fitments` | `GET` | Public | List all compatible vehicle variants for a product |
| `/api/v1/categories` / `.../tree` | `GET` | Public | List flat or nested hierarchical category tree |
| `/api/v1/brands` | `GET` | Public | List active automotive parts brands |
| `/api/v1/vehicles/makes` | `GET` | Public | List active vehicle makes (Toyota, Honda, etc.) |
| `/api/v1/vehicles/models` | `GET` | Public | List vehicle models by makeId |
| `/api/v1/vehicles/generations` | `GET` | Public | List vehicle generations by modelId |
| `/api/v1/vehicles/engines` | `GET` | Public | List vehicle engines by generationId |
| `/api/v1/vehicles/variants` | `GET` | Public | List vehicle variants by generationId and engineId |
| `/api/v1/vehicles/variants/:variantId/products` | `GET` | Public / Tier-Aware | List all compatible products for a specific vehicle variant |
| `/api/v1/admin/vehicles/...` | `GET/POST/PUT/DELETE` | Admin (`vehicle.*`) | Master CRUD for vehicle makes, models, generations, engines, variants |
| `/api/v1/admin/products/:id/fitments` | `POST/PUT/DELETE` | Admin (`fitment.*`) | Master CRUD for product-vehicle fitment records |
| `/api/v1/admin/products` | `GET/POST/PUT/DELETE` | Admin (`product.*`) | Master CRUD for products and pricing tiers |
| `/docs` | `GET` | Public / Dev | OpenAPI 3.0 Interactive Swagger UI |

---

## 4. Standardized Request Lifecycle

Every HTTP request traverses the following predictable lifecycle:

```
1. Request Ingestion
   └── Fastify generates/preserves UUIDv4 request ID (X-Request-ID).
2. Security & Rate Limiting
   └── Helmet headers applied; Origin checked against CORS whitelist; IP rate limits evaluated.
3. Cookie & Session Parsing (if protected route)
   └── HttpOnly cookie read -> SHA-256 hashed -> Session verified against DB -> User loaded into request.user.
4. RBAC Verification (if role/permission required)
   └── User roles & aggregated permissions verified -> 401 if missing auth, 403 if insufficient permission.
5. Input Validation
   └── Zod runtime schema validates request body/params/query -> 422 with structured details on failure.
6. Service Execution
   └── Domain logic executed in Service layer -> Database operations performed through Repositories.
7. Audit Trail
   └── Security/Authentication events asynchronously written to AuditLog table.
8. Standardized Response
   └── HTTP Status Code + JSON payload { data: ... } + X-Request-ID response header.
```

---

## 5. Standardized Error Handling

All unhandled exceptions and domain errors are caught by `errorHandler` in `apps/api/src/errors/error-handler.ts` and formatted into a consistent JSON structure.

### Error Response Schema
```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "requestId": "9c1b7f84-18c2-4a0b-8d76-928e46bc1209",
    "details": []
  }
}
```

### Standard Error Codes
| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400` | `BAD_REQUEST` | Malformed JSON or invalid syntax |
| `401` | `AUTH_UNAUTHORIZED` / `AUTH_INVALID_CREDENTIALS` | Unauthenticated request or invalid credentials |
| `403` | `FORBIDDEN` | Authenticated user lacks required role or permission |
| `404` | `NOT_FOUND` | Requested entity does not exist |
| `409` | `CONFLICT` | Entity conflict (e.g. duplicate email) |
| `422` | `VALIDATION_ERROR` | Schema validation error with field-level details |
| `429` | `RATE_LIMIT_EXCEEDED` | Request threshold exceeded |
| `500` | `INTERNAL_SERVER_ERROR` | Unhandled internal server error (stack trace sanitized) |

---

## 6. OpenAPI Documentation

The API includes native OpenAPI 3.0 documentation generated dynamically via `@fastify/swagger` and `@fastify/swagger-ui`.

- **Swagger UI:** Accessible at `http://localhost:3000/docs` in development.
- **OpenAPI JSON Spec:** Accessible at `http://localhost:3000/docs/json`.
