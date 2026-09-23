import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthUserResponse } from '../schemas/auth.schema';
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
export declare function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Optional authentication: if a valid session cookie or Bearer token is provided, attaches request.user.
 * If no session is provided, proceeds as anonymous without throwing 401.
 */
export declare function authenticateOptional(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Middleware factory requiring user to have one of the specified roles.
 */
export declare function requireRole(allowedRoles: string | string[]): (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
/**
 * Middleware factory requiring user to have at least one of the specified granular permissions.
 */
export declare function requirePermission(...permissions: (string | string[])[]): (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
