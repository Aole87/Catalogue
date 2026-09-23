export declare class TokenService {
    /**
     * Generates a cryptographically strong random session token (256 bits / 64 hex characters).
     */
    static generateSessionToken(): string;
    /**
     * Generates a deterministic SHA-256 hash of a raw session token.
     * Only this hash is persisted in the database.
     */
    static hashToken(token: string): string;
}
