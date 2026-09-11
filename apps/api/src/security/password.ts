import argon2 from 'argon2';

/**
 * Argon2id Password Hashing Specification (OWASP & RFC 9106 Aligned)
 * - Type: Argon2id (hybrid mode providing resistance against GPU cracking & side-channel cache attacks)
 * - Memory Cost: 65,536 KiB (64 MiB RAM per hash)
 * - Time Cost: 3 iterations
 * - Parallelism: 4 threads
 */
export const ARGON2ID_OPTIONS = {
  type: argon2.argon2id as 2,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export class PasswordService {
  /**
   * Securely hash a plaintext password using Argon2id.
   */
  static async hash(password: string): Promise<string> {
    return (await argon2.hash(password, ARGON2ID_OPTIONS)) as string;
  }

  /**
   * Verify a plaintext password against a stored Argon2id hash.
   */
  static async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false;
    }
  }
}
