import crypto from 'crypto';

export class TokenService {
  /**
   * Generates a cryptographically strong random session token (256 bits / 64 hex characters).
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates a deterministic SHA-256 hash of a raw session token.
   * Only this hash is persisted in the database.
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
  }
}
