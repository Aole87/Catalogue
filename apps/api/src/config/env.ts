import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TEST_DATABASE_URL: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().default('autoparts_session'),
  SESSION_COOKIE_SECRET: z.string().min(16, 'SESSION_COOKIE_SECRET must be at least 16 characters').default('super-secret-cookie-signing-key-minimum-16-chars'),
  SESSION_TTL_HOURS: z.coerce.number().default(24 * 7), // 7 days
  WEB_ORIGIN: z.string().default('https://market.autocentric.net'),
  CORS_ALLOWED_ORIGINS: z.string().default('https://market.autocentric.net,http://market.autocentric.net,http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'),
  RATE_LIMIT_MAX: z.coerce.number().default(1000),
  RATE_LIMIT_TIME_WINDOW: z.string().default('1 minute'),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10), // Brute force protection on auth routes
  AUTH_RATE_LIMIT_TIME_WINDOW: z.string().default('1 minute'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('MOBEX Auto Parts <noreply@autocentric.net>'),
  OTP_TTL_MINUTES: z.coerce.number().default(5),
  ADMIN_BYPASS_KEY: z.string().default('mobex_admin_bypass_2026'),
  ENABLE_SWAGGER: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});

export type Env = z.infer<typeof envSchema>;

export const config: Env = envSchema.parse(process.env);
export default config;
