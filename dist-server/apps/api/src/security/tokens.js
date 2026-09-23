"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class TokenService {
    /**
     * Generates a cryptographically strong random session token (256 bits / 64 hex characters).
     */
    static generateSessionToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Generates a deterministic SHA-256 hash of a raw session token.
     * Only this hash is persisted in the database.
     */
    static hashToken(token) {
        return crypto_1.default.createHash('sha256').update(token, 'utf8').digest('hex');
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=tokens.js.map