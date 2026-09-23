"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    HOST: zod_1.z.string().default('0.0.0.0'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    TEST_DATABASE_URL: zod_1.z.string().optional(),
    SESSION_COOKIE_NAME: zod_1.z.string().default('autoparts_session'),
    SESSION_COOKIE_SECRET: zod_1.z.string().min(16, 'SESSION_COOKIE_SECRET must be at least 16 characters').default('super-secret-cookie-signing-key-minimum-16-chars'),
    SESSION_TTL_HOURS: zod_1.z.coerce.number().default(24 * 7), // 7 days
    WEB_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    CORS_ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100),
    RATE_LIMIT_TIME_WINDOW: zod_1.z.string().default('1 minute'),
    AUTH_RATE_LIMIT_MAX: zod_1.z.coerce.number().default(10), // Brute force protection on auth routes
    AUTH_RATE_LIMIT_TIME_WINDOW: zod_1.z.string().default('1 minute'),
});
exports.config = envSchema.parse(process.env);
exports.default = exports.config;
//# sourceMappingURL=env.js.map