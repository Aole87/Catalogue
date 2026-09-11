# Security Architecture & Vulnerability Mitigation

## 1. Security Overview

Phase M2 establishes comprehensive server-side security controls covering authentication, authorization, session management, input sanitization, rate limiting, and security debt remediation.

---

## 2. Security Controls Implementation Matrix

| Security Layer | Implementation Mechanism | Status |
| :--- | :--- | :--- |
| **Password Hashing** | Argon2id (`memoryCost: 64MB, timeCost: 3, parallelism: 4`) | **VERIFIED (Gate A)** |
| **Session Security** | 256-bit crypto token, SHA-256 hash in PostgreSQL, `HttpOnly` Secure cookies | **VERIFIED (Gate B)** |
| **RBAC Enforcement** | Server-side `requireRole()` and `requirePermission()` Fastify middleware | **VERIFIED** |
| **Input Validation** | Zod runtime schema parsing on all endpoint payloads and params | **VERIFIED** |
| **CORS Policy** | Whitelist-only configured via `CORS_ALLOWED_ORIGINS` with credentials support | **VERIFIED** |
| **CSRF Mitigation** | Multi-layered defense: `SameSite=Lax/Strict` cookies + Origin / Referer validation | **VERIFIED** |
| **Rate Limiting** | Process-local Fastify rate limiter (Global: 100 req/min, Auth: 10 req/min) | **VERIFIED** |
| **Security Headers** | Helmet-configured CSP, X-Content-Type-Options, Referrer-Policy, Frameguard | **VERIFIED** |
| **Error Sanitization** | Centralized error handler stripping stack traces and internal DB schemas | **VERIFIED** |
| **Audit Logging** | Append-only database ledger tracking all authentication and privilege events | **VERIFIED** |

---

## 3. Security Debt Tracking & Status

### SEC-01: Arbitrary SQL Execution via Electron IPC
- **Description:** Legacy Electron main process exposed `window.electronAPI.query(sql, params)` allowing client JavaScript to execute arbitrary raw SQL statements against an embedded SQLite database.
- **Current Status:** **KNOWN ISSUE — transitional legacy SQL execution path (Gate C)**.
- **Remediation Roadmap:**
  1. In M2, the typed Fastify backend API (`/api/v1`) is established with zero arbitrary SQL endpoints.
  2. In M3–M6, frontend components will be progressively migrated to call `/api/v1` REST endpoints.
  3. Once all vertical slices are modernized, the legacy Electron IPC handler will be entirely deleted.

### SEC-02: Plaintext Passwords in Prototype
- **Description:** Early prototype stored plaintext passwords without hashing or salting.
- **Current Status:** **RESOLVED for all new authentication paths.**
  - Real authentication uses OWASP-recommended **Argon2id**.
  - Seed users are seeded with genuine Argon2id hashes (`$argon2id$`).
  - Migration strategy for any legacy SQLite users: forced password reset upon first login to the new platform.

### SEC-03: Lack of Session Architecture
- **Description:** Prototype lacked token-based sessions and state tracking.
- **Current Status:** **RESOLVED.**
  - PostgreSQL-backed `Session` table storing SHA-256 hashed 256-bit random tokens.
  - Delivered via `HttpOnly` Secure `SameSite` cookies.

### SEC-04: Dynamic SQL Table Interpolation
- **Description:** Prototype constructed dynamic table names and clauses via string interpolation.
- **Current Status:** **RESOLVED for backend.**
  - All database queries are executed via Prisma ORM parameterized queries with typed repositories.
  - Zero dynamic SQL string concatenation in the API codebase.

---

## 4. Rate Limiting Strategy

### Process-Local Limiter (Current Phase)
Implemented using `@fastify/rate-limit`:
- **Global API Limiter:** 100 requests / 1 minute window.
- **Authentication Limiter (`/register`, `/login`, `/change-password`):** 10 requests / 1 minute window.
- **Response Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- **Exceeded Action:** HTTP `429 Too Many Requests` with code `RATE_LIMIT_EXCEEDED`.

### Distributed Production Hardening Roadmap
- When scaling horizontally across multiple Node.js instances / Kubernetes pods, the rate limiter will be connected to a centralized Redis cluster via `@fastify/rate-limit` Redis store adapter.

---

## 5. Audit Logging Architecture

Security-critical actions are recorded in the `audit_logs` table via `AuditRepository.record()`:

- **Actions Logged:**
  - *Authentication:* `REGISTERED`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `PASSWORD_CHANGED`, `SESSION_REVOKED`, `ACCESS_DENIED`.
  - *Catalog & Brands:* `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`, `BRAND_CREATED`, `BRAND_UPDATED`, `BRAND_DELETED`, `CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED`.
  - *Vehicle Master Data:* `VEHICLE_MAKE_CREATED`, `VEHICLE_MAKE_UPDATED`, `VEHICLE_MAKE_DELETED`, `VEHICLE_MODEL_CREATED`, `VEHICLE_MODEL_UPDATED`, `VEHICLE_MODEL_DELETED`, `VEHICLE_GENERATION_CREATED`, `VEHICLE_GENERATION_UPDATED`, `VEHICLE_GENERATION_DELETED`, `VEHICLE_ENGINE_CREATED`, `VEHICLE_ENGINE_UPDATED`, `VEHICLE_ENGINE_DELETED`, `VEHICLE_VARIANT_CREATED`, `VEHICLE_VARIANT_UPDATED`, `VEHICLE_VARIANT_DELETED`.
  - *Fitment Engine:* `FITMENT_CREATED`, `FITMENT_UPDATED`, `FITMENT_DELETED`.
- **Recorded Attributes:** `userId` (when identifiable), `action`, `resource`, `resourceId`, `ipAddress`, `userAgent`, `before`/`after` context JSON, `createdAt`.
- **Data Redaction:** Passwords, password hashes, and session tokens are strictly filtered out of audit metadata before persistence.
