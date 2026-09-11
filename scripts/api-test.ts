import { buildApp } from '../apps/api/src/app';
import { prisma } from '@car-parts/database';
import { FastifyInstance } from 'fastify';
import argon2 from 'argon2';
import { requireRole, requirePermission } from '../apps/api/src/middleware/auth';

async function runApiTests() {
  console.log('🧪 Running Complete M2 API, Authentication, and RBAC Test Suite...\n');
  const app: FastifyInstance = await buildApp();

  // Register test routes for RBAC verification before calling app.ready()
  app.get('/test/admin-only', {
    preHandler: [requireRole('SUPER_ADMIN')],
    handler: async () => ({ status: 'admin_granted' }),
  });
  app.get('/test/product-write', {
    preHandler: [requirePermission('product.create')],
    handler: async () => ({ status: 'permission_granted' }),
  });

  await app.ready();

  let totalTests = 0;
  let passedTests = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error:`, err.message || err);
    }
  };

  // Helper to extract cookie from set-cookie header
  const extractCookie = (res: any, cookieName = 'autoparts_session') => {
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) return null;
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : setCookie;
    const match = cookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
    return match ? match[1] : null;
  };

  try {
    // --------------------------------------------------------------------------
    // 1. HEALTH & SYSTEM ENDPOINTS
    // --------------------------------------------------------------------------
    console.log('--- Group 1: Health & Readiness Probes ---');

    await test('GET /health returns 200 with service info', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.status !== 'ok' || !body.uptime) throw new Error('Invalid health payload');
    });

    await test('GET /ready returns 200 and verifies PostgreSQL connectivity', async () => {
      const res = await app.inject({ method: 'GET', url: '/ready' });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.status !== 'ready' || body.database !== 'connected') throw new Error('Invalid ready payload');
    });

    await test('GET /api/v1/health versioned endpoint works', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // 2. REGISTRATION & ARGON2ID SECURITY
    // --------------------------------------------------------------------------
    console.log('\n--- Group 2: Registration & Argon2id Password Security ---');

    const testTimestamp = Date.now();
    const testRegEmail = `test.user.${testTimestamp}@example.com`;
    const testPassword = 'StrongPassword@2026!';
    let registeredCookie: string | null = null;
    let registeredUserId: string | null = null;

    await test('POST /api/v1/auth/register creates user, assigns CUSTOMER role, and sets HttpOnly cookie', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: testRegEmail,
          password: testPassword,
          firstName: 'สมบูรณ์',
          lastName: 'ทดสอบ',
          phone: '0899998888',
        },
      });

      if (res.statusCode !== 201) {
        throw new Error(`Expected 201, got ${res.statusCode} with payload: ${res.payload}`);
      }

      const body = JSON.parse(res.payload);
      if (!body.data?.user?.id || body.data.user.email !== testRegEmail.toLowerCase()) {
        throw new Error('Registration response user data mismatch');
      }

      registeredUserId = body.data.user.id;

      // Verify CUSTOMER role assigned
      if (!body.data.user.roles.includes('CUSTOMER')) {
        throw new Error('Default role was not set to CUSTOMER');
      }

      // Verify no sensitive fields in response
      if ('password' in body.data.user || 'passwordHash' in body.data.user || 'tokenHash' in body.data.user) {
        throw new Error('Sensitive credentials leaked in registration response!');
      }

      // Verify HttpOnly cookie
      registeredCookie = extractCookie(res);
      if (!registeredCookie) {
        throw new Error('HttpOnly session cookie was not set in response headers');
      }

      const rawSetCookie = res.headers['set-cookie'] as string;
      if (!rawSetCookie.includes('HttpOnly')) {
        throw new Error('Session cookie is missing HttpOnly flag');
      }
    });

    await test('Verify stored password uses genuine Argon2id (Gate A)', async () => {
      if (!registeredUserId) throw new Error('No registered user to inspect');
      const dbUser = await prisma.user.findUnique({ where: { id: registeredUserId } });
      if (!dbUser) throw new Error('User not found in database');

      // 1. Verify Argon2id prefix
      if (!dbUser.passwordHash.startsWith('$argon2id$')) {
        throw new Error(`Expected password hash to start with '$argon2id$', got: ${dbUser.passwordHash}`);
      }

      // 2. Verify password with argon2 library
      const isValid = await argon2.verify(dbUser.passwordHash, testPassword);
      if (!isValid) {
        throw new Error('Argon2 verification failed for stored hash');
      }
    });

    await test('Reject duplicate email registration with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: testRegEmail, // DUPLICATE
          password: 'AnotherPassword@123',
          firstName: 'Duplicate',
          lastName: 'User',
        },
      });

      if (res.statusCode !== 409) {
        throw new Error(`Expected 409 Conflict, got ${res.statusCode}`);
      }
      const body = JSON.parse(res.payload);
      if (body.error?.code !== 'CONFLICT') {
        throw new Error(`Expected error code CONFLICT, got ${body.error?.code}`);
      }
    });

    await test('Reject malformed registration input with 422 Validation Error', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'not-an-email',
          password: 'short', // Too short
          firstName: '',
          lastName: '',
        },
      });

      if (res.statusCode !== 422) {
        throw new Error(`Expected 422 Validation Error, got ${res.statusCode}`);
      }
      const body = JSON.parse(res.payload);
      if (body.error?.code !== 'VALIDATION_ERROR' || !body.error.details) {
        throw new Error('Invalid validation error response structure');
      }
    });

    // --------------------------------------------------------------------------
    // 3. LOGIN & SESSION SECURITY
    // --------------------------------------------------------------------------
    console.log('\n--- Group 3: Login & Server-Side Session Security (Gate B) ---');

    await test('POST /api/v1/auth/login succeeds with valid credentials', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testRegEmail,
          password: testPassword,
        },
      });

      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.data?.user?.email !== testRegEmail.toLowerCase()) throw new Error('Login user mismatch');

      const loginCookie = extractCookie(res);
      if (!loginCookie) throw new Error('Session cookie not set on login');
    });

    await test('Verify raw session token is NEVER stored in database (Gate B)', async () => {
      if (!registeredCookie) throw new Error('No session cookie to inspect');
      const allSessions = await prisma.session.findMany({ where: { userId: registeredUserId! } });

      for (const s of allSessions) {
        if (s.tokenHash === registeredCookie) {
          throw new Error('CRITICAL SECURITY FLAW: Raw session token was stored directly in database!');
        }
        if (s.tokenHash.length !== 64) {
          throw new Error(`Expected SHA-256 token hash length 64, got ${s.tokenHash.length}`);
        }
      }
    });

    await test('Reject login with wrong password without leaking account existence (Generic 401)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testRegEmail,
          password: 'WrongPassword@123',
        },
      });

      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.error?.message !== 'Invalid email or password' || body.error?.code !== 'AUTH_INVALID_CREDENTIALS') {
        throw new Error(`Expected generic error 'Invalid email or password', got: ${body.error?.message}`);
      }
    });

    await test('Reject login for non-existent email with identical generic 401 message (No Account Enumeration)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: `nonexistent.${Date.now()}@example.com`,
          password: 'SomePassword@123',
        },
      });

      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.error?.message !== 'Invalid email or password') {
        throw new Error('Account enumeration vulnerability: Error message reveals non-existence');
      }
    });

    await test('Reject login for deactivated user with 401 Account Deactivated', async () => {
      // Temporarily deactivate user
      await prisma.user.update({ where: { id: registeredUserId! }, data: { isActive: false } });

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testRegEmail,
          password: testPassword,
        },
      });

      // Restore user active status
      await prisma.user.update({ where: { id: registeredUserId! }, data: { isActive: true } });

      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.error?.code !== 'ACCOUNT_DEACTIVATED') {
        throw new Error(`Expected ACCOUNT_DEACTIVATED code, got ${body.error?.code}`);
      }
    });

    // --------------------------------------------------------------------------
    // 4. CURRENT USER PROFILE (/api/v1/auth/me)
    // --------------------------------------------------------------------------
    console.log('\n--- Group 4: Authenticated Profile & Session Verification ---');

    await test('GET /api/v1/auth/me returns profile for authenticated user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        cookies: {
          autoparts_session: registeredCookie!,
        },
      });

      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.data?.user?.email !== testRegEmail.toLowerCase()) throw new Error('Me profile email mismatch');
      if (!Array.isArray(body.data.user.roles) || !Array.isArray(body.data.user.permissions)) {
        throw new Error('Roles or permissions missing in /auth/me payload');
      }
    });

    await test('GET /api/v1/auth/me returns 401 when no session cookie is provided', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.error?.code !== 'AUTH_SESSION_REQUIRED') {
        throw new Error(`Expected AUTH_SESSION_REQUIRED, got ${body.error?.code}`);
      }
    });

    // --------------------------------------------------------------------------
    // 5. PASSWORD CHANGE & SESSION REVOCATION
    // --------------------------------------------------------------------------
    console.log('\n--- Group 5: Password Change & Multi-Session Revocation ---');

    const newPassword = 'NewStrongPassword@2026!';

    await test('POST /api/v1/auth/change-password with wrong current password fails (401)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        cookies: { autoparts_session: registeredCookie! },
        payload: {
          currentPassword: 'WrongOldPassword@123',
          newPassword,
        },
      });

      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
    });

    await test('POST /api/v1/auth/change-password succeeds and updates hash with Argon2id', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/change-password',
        cookies: { autoparts_session: registeredCookie! },
        payload: {
          currentPassword: testPassword,
          newPassword,
        },
      });

      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);

      // Verify new hash in DB
      const dbUser = await prisma.user.findUnique({ where: { id: registeredUserId! } });
      const verifyNew = await argon2.verify(dbUser!.passwordHash, newPassword);
      if (!verifyNew) throw new Error('New password failed Argon2 verification');
    });

    // --------------------------------------------------------------------------
    // 6. LOGOUT & SESSION INVALIDATION
    // --------------------------------------------------------------------------
    console.log('\n--- Group 6: Logout & Session Invalidation ---');

    await test('POST /api/v1/auth/logout revokes session and clears cookie', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        cookies: { autoparts_session: registeredCookie! },
      });

      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);

      // Verify cookie is cleared in response
      const rawSetCookie = res.headers['set-cookie'] as string;
      if (!rawSetCookie.includes('autoparts_session=;')) {
        throw new Error('Logout did not clear session cookie');
      }

      // Subsequent /me call with revoked session cookie must fail with 401
      const meRes = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        cookies: { autoparts_session: registeredCookie! },
      });

      if (meRes.statusCode !== 401) {
        throw new Error(`Expected 401 after logout, got ${meRes.statusCode}`);
      }
    });

    // --------------------------------------------------------------------------
    // 7. RBAC AUTHORIZATION GUARDS
    // --------------------------------------------------------------------------
    // Login as consumer
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: testRegEmail, password: newPassword },
    });
    const consumerCookie = extractCookie(loginRes);

    // Login as seeded Super Admin
    const adminLoginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@mobex.co.th', password: 'Admin@123456' },
    });
    const adminCookie = extractCookie(adminLoginRes);

    await test('Unauthenticated request to protected route returns 401 Unauthorized', async () => {
      const res = await app.inject({ method: 'GET', url: '/test/admin-only' });
      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
    });

    await test('Authenticated CUSTOMER accessing admin route returns 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/test/admin-only',
        cookies: { autoparts_session: consumerCookie! },
      });

      if (res.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.error?.code !== 'INSUFFICIENT_ROLE') throw new Error(`Expected INSUFFICIENT_ROLE, got ${body.error?.code}`);
    });

    await test('Authenticated CUSTOMER accessing protected permission route returns 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/test/product-write',
        cookies: { autoparts_session: consumerCookie! },
      });

      if (res.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.error?.code !== 'INSUFFICIENT_PERMISSIONS') throw new Error(`Expected INSUFFICIENT_PERMISSIONS, got ${body.error?.code}`);
    });

    await test('Authenticated SUPER_ADMIN accessing admin route returns 200 OK', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/test/admin-only',
        cookies: { autoparts_session: adminCookie! },
      });

      if (res.statusCode !== 200) throw new Error(`Expected 200 OK for admin, got ${res.statusCode}`);
    });

    await test('Authenticated SUPER_ADMIN accessing permission route returns 200 OK', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/test/product-write',
        cookies: { autoparts_session: adminCookie! },
      });

      if (res.statusCode !== 200) throw new Error(`Expected 200 OK for admin, got ${res.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // 8. SECURITY CONTROLS & AUDIT TRAIL
    // --------------------------------------------------------------------------
    console.log('\n--- Group 8: Security Headers, Request IDs & Audit Trails ---');

    await test('Responses include X-Request-ID and Helmet security headers', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });
      if (!res.headers['x-request-id']) throw new Error('X-Request-ID header missing');
      if (!res.headers['x-content-type-options']) throw new Error('X-Content-Type-Options header missing');
      if (!res.headers['x-frame-options'] && !res.headers['content-security-policy']) {
        throw new Error('Frame protection headers missing');
      }
    });

    await test('Audit trail records authentication events in database', async () => {
      const logs = await prisma.auditLog.findMany({
        where: { userId: registeredUserId! },
        orderBy: { createdAt: 'desc' },
      });

      const actions = logs.map((l) => l.action);
      if (!actions.includes('REGISTERED')) throw new Error('REGISTERED audit log missing');
      if (!actions.includes('LOGIN_SUCCESS')) throw new Error('LOGIN_SUCCESS audit log missing');
      if (!actions.includes('LOGOUT')) throw new Error('LOGOUT audit log missing');
      if (!actions.includes('PASSWORD_CHANGED')) throw new Error('PASSWORD_CHANGED audit log missing');

      // Verify no passwords or tokens were recorded in audit logs
      for (const l of logs) {
        const str = JSON.stringify(l);
        if (str.includes(testPassword) || str.includes(newPassword) || (registeredCookie && str.includes(registeredCookie))) {
          throw new Error('SECURITY VIOLATION: Secret password or raw token was recorded in audit log!');
        }
      }
    });

    // Clean up test user
    await prisma.user.delete({ where: { id: registeredUserId! } });

    console.log(`\n======================================================`);
    console.log(`Results: ${passedTests} / ${totalTests} M2 tests PASSED.`);
    console.log(`======================================================\n`);

    if (passedTests === totalTests) {
      console.log('🎉 M2 API, Authentication, and RBAC Test Suite PASSED 100%!');
      process.exit(0);
    } else {
      console.error('❌ Some tests failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected test execution error:', err);
    process.exit(1);
  } finally {
    await app.close();
    await prisma.$disconnect();
  }
}

runApiTests();
