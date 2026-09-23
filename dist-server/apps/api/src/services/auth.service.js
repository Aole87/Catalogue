"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const session_repository_1 = require("../repositories/session.repository");
const role_repository_1 = require("../repositories/role.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const password_1 = require("../security/password");
const tokens_1 = require("../security/tokens");
const app_error_1 = require("../errors/app-error");
const env_1 = __importDefault(require("../config/env"));
class AuthService {
    /**
     * Transforms raw User entity into secure AuthUserResponse (zero password or token leaks).
     */
    static formatUserResponse(user) {
        const roles = [];
        const permissionsSet = new Set();
        if (user.roles) {
            for (const ur of user.roles) {
                if (ur.role) {
                    roles.push(ur.role.name);
                    if (ur.role.permissions) {
                        for (const rp of ur.role.permissions) {
                            if (rp.permission) {
                                permissionsSet.add(`${rp.permission.resource}.${rp.permission.action}`);
                            }
                        }
                    }
                }
            }
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            phone: user.phone,
            isActive: user.isActive,
            customerProfile: user.customerProfile
                ? {
                    id: user.customerProfile.id,
                    customerType: user.customerProfile.customerType,
                    companyName: user.customerProfile.companyName,
                    isVerified: user.customerProfile.isVerified,
                }
                : null,
            roles,
            permissions: Array.from(permissionsSet),
        };
    }
    /**
     * Register a new consumer user and start a secure session.
     */
    static async register(input, metadata) {
        const normalizedEmail = input.email.toLowerCase().trim();
        // 1. Check for duplicate email
        const existing = await user_repository_1.UserRepository.findByEmail(normalizedEmail);
        if (existing) {
            throw new app_error_1.ConflictError('An account with this email already exists', { field: 'email' });
        }
        // 2. Fetch standard non-privileged CUSTOMER role (Prevents self-assigned privilege escalation)
        const customerRole = await role_repository_1.RoleRepository.getOrCreateDefaultCustomerRole();
        // 3. Hash password using Argon2id
        const passwordHash = await password_1.PasswordService.hash(input.password);
        // 4. Create User & CustomerProfile transactionally
        const user = await user_repository_1.UserRepository.createWithCustomer({
            email: normalizedEmail,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            displayName: input.displayName,
        }, customerRole.id);
        // 5. Generate secure random session token and hash it
        const rawToken = tokens_1.TokenService.generateSessionToken();
        const tokenHash = tokens_1.TokenService.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + env_1.default.SESSION_TTL_HOURS * 60 * 60 * 1000);
        await session_repository_1.SessionRepository.create({
            userId: user.id,
            tokenHash,
            expiresAt,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });
        // 6. Record audit log
        await audit_repository_1.AuditRepository.record({
            userId: user.id,
            action: 'REGISTERED',
            resource: 'User',
            resourceId: user.id,
            after: { email: user.email, customerType: 'CUSTOMER' },
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });
        return {
            user: this.formatUserResponse(user),
            sessionToken: rawToken,
            expiresAt,
        };
    }
    /**
     * Authenticate a user via email and Argon2id password hash check.
     */
    static async login(input, metadata) {
        const normalizedEmail = input.email.toLowerCase().trim();
        // 1. Find user by email
        const user = await user_repository_1.UserRepository.findByEmail(normalizedEmail);
        if (!user) {
            // Record failed login audit with no user ID (prevents email enumeration via timing or response)
            await audit_repository_1.AuditRepository.record({
                action: 'LOGIN_FAILED',
                resource: 'User',
                before: { attemptedEmail: normalizedEmail },
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            throw new app_error_1.UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
        }
        // 2. Verify password with Argon2id
        const isValidPassword = await password_1.PasswordService.verify(user.passwordHash, input.password);
        if (!isValidPassword) {
            await audit_repository_1.AuditRepository.record({
                userId: user.id,
                action: 'LOGIN_FAILED',
                resource: 'User',
                resourceId: user.id,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            throw new app_error_1.UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
        }
        // 3. Verify user is active
        if (!user.isActive || user.deletedAt) {
            await audit_repository_1.AuditRepository.record({
                userId: user.id,
                action: 'LOGIN_DEACTIVATED',
                resource: 'User',
                resourceId: user.id,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
            throw new app_error_1.UnauthorizedError('This account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
        }
        // 4. Update last login timestamp
        await user_repository_1.UserRepository.updateLastLogin(user.id);
        // 5. Generate secure session token and hash
        const rawToken = tokens_1.TokenService.generateSessionToken();
        const tokenHash = tokens_1.TokenService.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + env_1.default.SESSION_TTL_HOURS * 60 * 60 * 1000);
        await session_repository_1.SessionRepository.create({
            userId: user.id,
            tokenHash,
            expiresAt,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });
        // 6. Record audit log
        await audit_repository_1.AuditRepository.record({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            resource: 'User',
            resourceId: user.id,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });
        return {
            user: this.formatUserResponse(user),
            sessionToken: rawToken,
            expiresAt,
        };
    }
    /**
     * Log out and revoke session token.
     */
    static async logout(sessionToken, metadata) {
        if (!sessionToken)
            return;
        const tokenHash = tokens_1.TokenService.hashToken(sessionToken);
        const session = await session_repository_1.SessionRepository.findValidByTokenHash(tokenHash);
        if (session) {
            await session_repository_1.SessionRepository.revokeByTokenHash(tokenHash);
            await audit_repository_1.AuditRepository.record({
                userId: session.userId,
                action: 'LOGOUT',
                resource: 'Session',
                resourceId: session.id,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            });
        }
    }
    /**
     * Retrieve currently authenticated user profile with roles and permissions.
     */
    static async getMe(userId) {
        const user = await user_repository_1.UserRepository.findById(userId);
        if (!user || !user.isActive || user.deletedAt) {
            throw new app_error_1.NotFoundError('User profile not found or inactive');
        }
        return this.formatUserResponse(user);
    }
    /**
     * Change password with Argon2id validation and revoke other active sessions.
     */
    static async changePassword(userId, currentSessionToken, input, metadata) {
        const user = await user_repository_1.UserRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User not found');
        }
        // 1. Verify current password
        const isCurrentValid = await password_1.PasswordService.verify(user.passwordHash, input.currentPassword);
        if (!isCurrentValid) {
            throw new app_error_1.UnauthorizedError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
        }
        // 2. Hash new password with Argon2id
        const newPasswordHash = await password_1.PasswordService.hash(input.newPassword);
        await user_repository_1.UserRepository.updatePassword(userId, newPasswordHash);
        // 3. Revoke all other sessions except current
        const currentTokenHash = tokens_1.TokenService.hashToken(currentSessionToken);
        await session_repository_1.SessionRepository.revokeAllForUser(userId, currentTokenHash);
        // 4. Record audit log
        await audit_repository_1.AuditRepository.record({
            userId,
            action: 'PASSWORD_CHANGED',
            resource: 'User',
            resourceId: userId,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map