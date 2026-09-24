import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import config from '../config/env';

export async function authRoutes(app: FastifyInstance) {
  // Rate-limiting configuration for sensitive authentication endpoints
  const authRateLimitConfig = {
    max: config.AUTH_RATE_LIMIT_MAX,
    timeWindow: config.AUTH_RATE_LIMIT_TIME_WINDOW,
  };

  // POST /api/v1/auth/otp/send
  app.post('/otp/send', {
    config: {
      rateLimit: authRateLimitConfig,
    },
    schema: {
      description: 'Generate and send a 6-digit email OTP for registration or verification',
      tags: ['Authentication'],
    },
    handler: AuthController.sendOtp,
  });

  // POST /api/v1/auth/otp/verify
  app.post('/otp/verify', {
    config: {
      rateLimit: authRateLimitConfig,
    },
    schema: {
      description: 'Verify 6-digit email OTP code and receive verification proof',
      tags: ['Authentication'],
    },
    handler: AuthController.verifyOtp,
  });

  // POST /api/v1/auth/register
  app.post('/register', {
    config: {
      rateLimit: authRateLimitConfig,
    },
    schema: {
      description: 'Register a new consumer account and start an authenticated session',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 100 },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          phone: { type: 'string' },
          displayName: { type: 'string' },
        },
      },
    },
    handler: AuthController.register,
  });

  // POST /api/v1/auth/login
  app.post('/login', {
    config: {
      rateLimit: authRateLimitConfig,
    },
    schema: {
      description: 'Authenticate user via email and password; issues an HttpOnly session cookie',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 },
        },
      },
    },
    handler: AuthController.login,
  });

  // POST /api/v1/auth/logout
  app.post('/logout', {
    schema: {
      description: 'Revoke active session token and clear HttpOnly cookie',
      tags: ['Authentication'],
    },
    handler: AuthController.logout,
  });

  // GET /api/v1/auth/me
  app.get('/me', {
    preHandler: [authenticate],
    schema: {
      description: 'Get profile, roles, and granular permissions for the currently authenticated user',
      tags: ['Authentication'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: AuthController.getMe,
  });

  // POST /api/v1/auth/change-password
  app.post('/change-password', {
    preHandler: [authenticate],
    config: {
      rateLimit: authRateLimitConfig,
    },
    schema: {
      description: 'Change user password with current password verification; revokes other active sessions',
      tags: ['Authentication'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8, maxLength: 100 },
        },
      },
    },
    handler: AuthController.changePassword,
  });
}
