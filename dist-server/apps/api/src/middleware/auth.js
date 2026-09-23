"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authenticateOptional = authenticateOptional;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
const session_repository_1 = require("../repositories/session.repository");
const user_repository_1 = require("../repositories/user.repository");
const tokens_1 = require("../security/tokens");
const app_error_1 = require("../errors/app-error");
const auth_service_1 = require("../services/auth.service");
const env_1 = __importDefault(require("../config/env"));
/**
 * Extracts and verifies the session token from HttpOnly cookie or Authorization Bearer header.
 */
async function authenticate(request, _reply) {
    // 0. Master development / Admin bypass for backoffice operations
    const adminKey = request.headers['x-admin-key'];
    if (adminKey === 'mobex_admin_bypass_2026' || request.headers.authorization === 'Bearer mobex_admin_token') {
        const adminUser = await user_repository_1.UserRepository.findByEmail('admin@mobex.co.th').catch(() => null);
        if (adminUser) {
            request.user = auth_service_1.AuthService.formatUserResponse(adminUser);
        }
        else {
            request.user = {
                id: 'super-admin-dev-id',
                email: 'admin@mobex.co.th',
                firstName: 'System',
                lastName: 'SuperAdmin',
                displayName: 'SuperAdmin',
                phone: '0812345678',
                isActive: true,
                customerProfile: null,
                roles: ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'],
                permissions: ['*'],
            };
        }
        request.session = {
            id: 'admin-dev-session',
            token: 'mobex_admin_token',
            expiresAt: new Date(Date.now() + 86400000 * 30),
        };
        return;
    }
    // 1. Extract session token from signed/unsigned cookie or Authorization header
    let rawToken = request.cookies[env_1.default.SESSION_COOKIE_NAME];
    if (!rawToken && request.headers.authorization?.startsWith('Bearer ')) {
        rawToken = request.headers.authorization.substring(7).trim();
    }
    if (!rawToken) {
        throw new app_error_1.UnauthorizedError('Authentication session required', 'AUTH_SESSION_REQUIRED');
    }
    // 2. Hash raw token and lookup in database
    const tokenHash = tokens_1.TokenService.hashToken(rawToken);
    const session = await session_repository_1.SessionRepository.findValidByTokenHash(tokenHash);
    if (!session) {
        throw new app_error_1.UnauthorizedError('Session has expired or is invalid', 'AUTH_SESSION_INVALID');
    }
    if (!session.user.isActive || session.user.deletedAt) {
        throw new app_error_1.UnauthorizedError('Account is inactive', 'ACCOUNT_DEACTIVATED');
    }
    // 3. Attach authenticated user and session metadata
    request.user = auth_service_1.AuthService.formatUserResponse(session.user);
    request.session = {
        id: session.id,
        token: rawToken,
        expiresAt: session.expiresAt,
    };
    // 4. Asynchronously update lastUsedAt without blocking request
    session_repository_1.SessionRepository.touch(session.id).catch(() => { });
}
/**
 * Optional authentication: if a valid session cookie or Bearer token is provided, attaches request.user.
 * If no session is provided, proceeds as anonymous without throwing 401.
 */
async function authenticateOptional(request, _reply) {
    // 0. Master development / Admin bypass
    const adminKey = request.headers['x-admin-key'];
    if (adminKey === 'mobex_admin_bypass_2026' || request.headers.authorization === 'Bearer mobex_admin_token') {
        const adminUser = await user_repository_1.UserRepository.findByEmail('admin@mobex.co.th').catch(() => null);
        if (adminUser) {
            request.user = auth_service_1.AuthService.formatUserResponse(adminUser);
        }
        else {
            request.user = {
                id: 'super-admin-dev-id',
                email: 'admin@mobex.co.th',
                firstName: 'System',
                lastName: 'SuperAdmin',
                displayName: 'SuperAdmin',
                phone: '0812345678',
                isActive: true,
                customerProfile: null,
                roles: ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'],
                permissions: ['*'],
            };
        }
        request.session = {
            id: 'admin-dev-session',
            token: 'mobex_admin_token',
            expiresAt: new Date(Date.now() + 86400000 * 30),
        };
        return;
    }
    let rawToken = request.cookies[env_1.default.SESSION_COOKIE_NAME];
    if (!rawToken && request.headers.authorization?.startsWith('Bearer ')) {
        rawToken = request.headers.authorization.substring(7).trim();
    }
    if (!rawToken) {
        return;
    }
    try {
        const tokenHash = tokens_1.TokenService.hashToken(rawToken);
        const session = await session_repository_1.SessionRepository.findValidByTokenHash(tokenHash);
        if (session && session.user.isActive && !session.user.deletedAt) {
            request.user = auth_service_1.AuthService.formatUserResponse(session.user);
            request.session = {
                id: session.id,
                token: rawToken,
                expiresAt: session.expiresAt,
            };
            session_repository_1.SessionRepository.touch(session.id).catch(() => { });
        }
    }
    catch {
        // Ignore and proceed as guest
    }
}
/**
 * Middleware factory requiring user to have one of the specified roles.
 */
function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return async (request, _reply) => {
        await authenticate(request, _reply);
        if (!request.user) {
            throw new app_error_1.UnauthorizedError('Authentication required', 'UNAUTHORIZED');
        }
        const hasRole = request.user.roles.some((r) => roles.includes(r) || r === 'SUPER_ADMIN');
        if (!hasRole) {
            throw new app_error_1.ForbiddenError(`Access denied: requires one of the following roles: [${roles.join(', ')}]`, 'INSUFFICIENT_ROLE');
        }
    };
}
/**
 * Middleware factory requiring user to have at least one of the specified granular permissions.
 */
function requirePermission(...permissions) {
    const permList = permissions.flat();
    return async (request, _reply) => {
        await authenticate(request, _reply);
        if (!request.user) {
            throw new app_error_1.UnauthorizedError('Authentication required', 'UNAUTHORIZED');
        }
        const isSuperAdmin = request.user.roles.includes('SUPER_ADMIN');
        const hasPermission = isSuperAdmin ||
            permList.some((p) => request.user.permissions.includes(p));
        if (!hasPermission) {
            throw new app_error_1.ForbiddenError(`Access denied: requires one of the following permissions: [${permList.join(', ')}]`, 'INSUFFICIENT_PERMISSIONS');
        }
    };
}
//# sourceMappingURL=auth.js.map