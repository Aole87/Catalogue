"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const env_1 = __importDefault(require("../config/env"));
async function authRoutes(app) {
    // Rate-limiting configuration for sensitive authentication endpoints
    const authRateLimitConfig = {
        max: env_1.default.AUTH_RATE_LIMIT_MAX,
        timeWindow: env_1.default.AUTH_RATE_LIMIT_TIME_WINDOW,
    };
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
        handler: auth_controller_1.AuthController.register,
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
        handler: auth_controller_1.AuthController.login,
    });
    // POST /api/v1/auth/logout
    app.post('/logout', {
        schema: {
            description: 'Revoke active session token and clear HttpOnly cookie',
            tags: ['Authentication'],
        },
        handler: auth_controller_1.AuthController.logout,
    });
    // GET /api/v1/auth/me
    app.get('/me', {
        preHandler: [auth_1.authenticate],
        schema: {
            description: 'Get profile, roles, and granular permissions for the currently authenticated user',
            tags: ['Authentication'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: auth_controller_1.AuthController.getMe,
    });
    // POST /api/v1/auth/change-password
    app.post('/change-password', {
        preHandler: [auth_1.authenticate],
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
        handler: auth_controller_1.AuthController.changePassword,
    });
}
//# sourceMappingURL=auth.routes.js.map