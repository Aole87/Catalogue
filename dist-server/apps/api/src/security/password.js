"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = exports.ARGON2ID_OPTIONS = void 0;
const argon2_1 = __importDefault(require("argon2"));
/**
 * Argon2id Password Hashing Specification (OWASP & RFC 9106 Aligned)
 * - Type: Argon2id (hybrid mode providing resistance against GPU cracking & side-channel cache attacks)
 * - Memory Cost: 65,536 KiB (64 MiB RAM per hash)
 * - Time Cost: 3 iterations
 * - Parallelism: 4 threads
 */
exports.ARGON2ID_OPTIONS = {
    type: argon2_1.default.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
};
class PasswordService {
    /**
     * Securely hash a plaintext password using Argon2id.
     */
    static async hash(password) {
        return (await argon2_1.default.hash(password, exports.ARGON2ID_OPTIONS));
    }
    /**
     * Verify a plaintext password against a stored Argon2id hash.
     */
    static async verify(hash, plaintext) {
        try {
            return await argon2_1.default.verify(hash, plaintext);
        }
        catch {
            return false;
        }
    }
}
exports.PasswordService = PasswordService;
//# sourceMappingURL=password.js.map