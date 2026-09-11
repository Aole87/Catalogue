# Authentication Architecture

## 1. Overview & Architecture Decision

The platform implements **Server-Managed Stateful Sessions** backed by PostgreSQL, using cryptographic random tokens transmitted exclusively via `HttpOnly` Secure cookies (or `Bearer` authorization headers for headless API clients).

Stateless JWTs stored in `localStorage` or `sessionStorage` are **strictly rejected** due to XSS theft vulnerability, lack of instant session revocation, and stale role/permission claims.

```
Browser Client
      │
      │ 1. POST /api/v1/auth/login { email, password }
      ▼
Fastify Server
      │
      │ 2. Verify Argon2id(password, db.passwordHash)
      │ 3. Generate 256-bit crypto token (64 hex characters)
      │ 4. Compute SHA-256(token) -> tokenHash
      │ 5. Insert Session row in PostgreSQL
      │ 6. Set Set-Cookie: autoparts_session=<raw_token>; HttpOnly; Secure; SameSite=Lax
      ▼
Client Browser
      │
      │ 7. Subsequent Request with Cookie: autoparts_session=<raw_token>
      ▼
Fastify Server
      │
      │ 8. Compute SHA-256(raw_token)
      │ 9. Lookup Session WHERE tokenHash = $1 AND expiresAt > NOW() AND revokedAt IS NULL
      │ 10. Update lastUsedAt timestamp
      │ 11. Load active User, Roles, and Permissions into request.user
      ▼
Business Logic / Controller
```

---

## 2. Password Security (Gate A)

### Argon2id Hashing Standard
All user passwords are encrypted using **Argon2id** (RFC 9106 recommended hybrid), providing state-of-the-art resistance against GPU/ASIC brute-force cracking and side-channel timing attacks.

- **Library:** `argon2` (native C++ bindings / Node.js standard)
- **Algorithm Type:** `argon2id` (v=19)
- **Memory Cost (`m`):** `65536 KiB` (64 MB)
- **Time Cost (`t`):** `3` iterations
- **Parallelism (`p`):** `4` threads
- **Hash Output Prefix:** `$argon2id$v=19$m=65536,t=3,p=4$...`

### Strict Password Handling Rules
1. **Never Plaintext:** Raw passwords are never stored in the database or serialized to log files.
2. **Server-Side Verification:** Password verification is executed solely on the backend using `argon2.verify()`.
3. **No Credential Leakage:** User responses, audit logs, and error handlers sanitize and redact `password`, `passwordHash`, and `tokenHash`.
4. **Generic Authentication Failures:** Failed login attempts return a uniform `401 Unauthorized` (`Invalid email or password`) without disclosing whether the email exists or if the password was incorrect, preventing account enumeration.

---

## 3. Session Security & Database Schema (Gate B)

### Session Model (`sessions` table)
```prisma
model Session {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String    @map("user_id") @db.Uuid
  tokenHash  String    @unique @map("token_hash") @db.VarChar(64)
  expiresAt  DateTime  @map("expires_at") @db.Timestamptz(6)
  revokedAt  DateTime? @map("revoked_at") @db.Timestamptz(6)
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  lastUsedAt DateTime  @default(now()) @map("last_used_at") @db.Timestamptz(6)
  ipAddress  String?   @map("ip_address") @db.VarChar(45)
  userAgent  String?   @map("user_agent") @db.Text

  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}
```

### Security Properties
1. **Raw Token Invisibility:** The raw 256-bit token is returned to the client once upon login/registration. Only the one-way `SHA-256` digest is stored in PostgreSQL. A database compromise does not leak valid active sessions.
2. **HttpOnly Cookie:**
   - Name: `autoparts_session`
   - Flags: `HttpOnly; Path=/; SameSite=Lax` (or `SameSite=Strict` in production); `Secure` enabled on HTTPS/production.
   - Inaccessible to client JavaScript, mitigating XSS session theft.
3. **Session Revocation:**
   - `POST /api/v1/auth/logout` sets `revokedAt = NOW()`, instantly invalidating the session.
   - `POST /api/v1/auth/change-password` revokes all other active sessions for that user account while keeping the current session active.
4. **Session Expiry:** Default TTL is 7 days (`7 * 24 * 60 * 60 * 1000` ms). Requests with expired timestamps are rejected with `401 Unauthorized`.
5. **Account Status Check:** If a user account has `isActive = false` or `deletedAt IS NOT NULL`, authentication is immediately rejected.

---

## 4. Authentication Endpoints

### 1. `POST /api/v1/auth/register`
- Registers a new user account with `CUSTOMER` role.
- Automatically creates an associated `CustomerProfile`.
- Clients **cannot** supply privileged roles (`ADMIN`, `STAFF`, etc.) during registration.
- On success, issues a session cookie and returns HTTP `201 Created`.

### 2. `POST /api/v1/auth/login`
- Validates credentials via Argon2id.
- On success, updates `lastLoginAt`, generates a session, sets cookie, logs audit event `LOGIN_SUCCESS`, and returns HTTP `200 OK`.
- On failure, returns generic `401 Unauthorized` and logs `LOGIN_FAILED`.

### 3. `POST /api/v1/auth/logout`
- Revokes active session in PostgreSQL and clears the session cookie.
- Logs audit event `LOGOUT`. Safe to call idempotently.

### 4. `GET /api/v1/auth/me`
- Requires authentication.
- Returns user details, customer profile, assigned roles, and aggregated distinct permissions.
- Password hashes and session hashes are strictly omitted.

### 5. `POST /api/v1/auth/change-password`
- Requires authentication.
- Verifies `currentPassword` with Argon2id.
- Hashes `newPassword` with Argon2id and updates the user record.
- Revokes all other active sessions for this user.
- Logs audit event `PASSWORD_CHANGED`.
