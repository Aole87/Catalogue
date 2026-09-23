/**
 * Argon2id Password Hashing Specification (OWASP & RFC 9106 Aligned)
 * - Type: Argon2id (hybrid mode providing resistance against GPU cracking & side-channel cache attacks)
 * - Memory Cost: 65,536 KiB (64 MiB RAM per hash)
 * - Time Cost: 3 iterations
 * - Parallelism: 4 threads
 */
export declare const ARGON2ID_OPTIONS: {
    type: 2;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
};
export declare class PasswordService {
    /**
     * Securely hash a plaintext password using Argon2id.
     */
    static hash(password: string): Promise<string>;
    /**
     * Verify a plaintext password against a stored Argon2id hash.
     */
    static verify(hash: string, plaintext: string): Promise<boolean>;
}
