import { RegisterInput, LoginInput, ChangePasswordInput, AuthUserResponse } from '../schemas/auth.schema';
export interface RequestMetadata {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
}
export declare class AuthService {
    /**
     * Transforms raw User entity into secure AuthUserResponse (zero password or token leaks).
     */
    static formatUserResponse(user: any): AuthUserResponse;
    /**
     * Register a new consumer user and start a secure session.
     */
    static register(input: RegisterInput, metadata: RequestMetadata): Promise<{
        user: AuthUserResponse;
        sessionToken: string;
        expiresAt: Date;
    }>;
    /**
     * Authenticate a user via email and Argon2id password hash check.
     */
    static login(input: LoginInput, metadata: RequestMetadata): Promise<{
        user: AuthUserResponse;
        sessionToken: string;
        expiresAt: Date;
    }>;
    /**
     * Log out and revoke session token.
     */
    static logout(sessionToken: string, metadata: RequestMetadata): Promise<void>;
    /**
     * Retrieve currently authenticated user profile with roles and permissions.
     */
    static getMe(userId: string): Promise<AuthUserResponse>;
    /**
     * Change password with Argon2id validation and revoke other active sessions.
     */
    static changePassword(userId: string, currentSessionToken: string, input: ChangePasswordInput, metadata: RequestMetadata): Promise<void>;
}
