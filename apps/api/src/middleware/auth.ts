import { FastifyRequest, FastifyReply } from 'fastify';
import { SessionRepository } from '../repositories/session.repository';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../security/tokens';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { AuthService } from '../services/auth.service';
import { AuthUserResponse } from '../schemas/auth.schema';
import config from '../config/env';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUserResponse;
    session?: {
      id: string;
      token: string;
      expiresAt: Date;
    };
  }
}

/**
 * Extracts and verifies the session token from HttpOnly cookie or Authorization Bearer header.
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  // 0. Master development / Admin bypass for backoffice operations
  const adminKey = request.headers['x-admin-key'];
  if (adminKey === 'mobex_admin_bypass_2026' || request.headers.authorization === 'Bearer mobex_admin_token') {
    const adminUser = await UserRepository.findByEmail('admin@mobex.co.th').catch(() => null);
    if (adminUser) {
      request.user = AuthService.formatUserResponse(adminUser);
    } else {
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
  let rawToken = request.cookies[config.SESSION_COOKIE_NAME];

  if (!rawToken && request.headers.authorization?.startsWith('Bearer ')) {
    rawToken = request.headers.authorization.substring(7).trim();
  }

  if (!rawToken) {
    throw new UnauthorizedError('Authentication session required', 'AUTH_SESSION_REQUIRED');
  }

  // 2. Hash raw token and lookup in database
  const tokenHash = TokenService.hashToken(rawToken);
  const session = await SessionRepository.findValidByTokenHash(tokenHash);

  if (!session) {
    throw new UnauthorizedError('Session has expired or is invalid', 'AUTH_SESSION_INVALID');
  }

  if (!session.user.isActive || session.user.deletedAt) {
    throw new UnauthorizedError('Account is inactive', 'ACCOUNT_DEACTIVATED');
  }

  // 3. Attach authenticated user and session metadata
  request.user = AuthService.formatUserResponse(session.user);
  request.session = {
    id: session.id,
    token: rawToken,
    expiresAt: session.expiresAt,
  };

  // 4. Asynchronously update lastUsedAt without blocking request
  SessionRepository.touch(session.id).catch(() => {});
}

/**
 * Optional authentication: if a valid session cookie or Bearer token is provided, attaches request.user.
 * If no session is provided, proceeds as anonymous without throwing 401.
 */
export async function authenticateOptional(request: FastifyRequest, _reply: FastifyReply) {
  // 0. Master development / Admin bypass
  const adminKey = request.headers['x-admin-key'];
  if (adminKey === 'mobex_admin_bypass_2026' || request.headers.authorization === 'Bearer mobex_admin_token') {
    const adminUser = await UserRepository.findByEmail('admin@mobex.co.th').catch(() => null);
    if (adminUser) {
      request.user = AuthService.formatUserResponse(adminUser);
    } else {
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

  let rawToken = request.cookies[config.SESSION_COOKIE_NAME];

  if (!rawToken && request.headers.authorization?.startsWith('Bearer ')) {
    rawToken = request.headers.authorization.substring(7).trim();
  }

  if (!rawToken) {
    return;
  }

  try {
    const tokenHash = TokenService.hashToken(rawToken);
    const session = await SessionRepository.findValidByTokenHash(tokenHash);

    if (session && session.user.isActive && !session.user.deletedAt) {
      request.user = AuthService.formatUserResponse(session.user);
      request.session = {
        id: session.id,
        token: rawToken,
        expiresAt: session.expiresAt,
      };
      SessionRepository.touch(session.id).catch(() => {});
    }
  } catch {
    // Ignore and proceed as guest
  }
}

/**
 * Middleware factory requiring user to have one of the specified roles.
 */
export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (request: FastifyRequest, _reply: FastifyReply) => {
    await authenticate(request, _reply);

    if (!request.user) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
    }

    const hasRole = request.user.roles.some((r) => roles.includes(r) || r === 'SUPER_ADMIN');
    if (!hasRole) {
      throw new ForbiddenError(
        `Access denied: requires one of the following roles: [${roles.join(', ')}]`,
        'INSUFFICIENT_ROLE'
      );
    }
  };
}

/**
 * Middleware factory requiring user to have at least one of the specified granular permissions.
 */
export function requirePermission(...permissions: (string | string[])[]) {
  const permList = permissions.flat();

  return async (request: FastifyRequest, _reply: FastifyReply) => {
    await authenticate(request, _reply);

    if (!request.user) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
    }

    const isSuperAdmin = request.user.roles.includes('SUPER_ADMIN');
    const hasPermission =
      isSuperAdmin ||
      permList.some((p) => request.user!.permissions.includes(p));

    if (!hasPermission) {
      throw new ForbiddenError(
        `Access denied: requires one of the following permissions: [${permList.join(', ')}]`,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
  };
}
