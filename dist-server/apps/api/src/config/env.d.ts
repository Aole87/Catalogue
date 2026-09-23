import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    HOST: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    TEST_DATABASE_URL: z.ZodOptional<z.ZodString>;
    SESSION_COOKIE_NAME: z.ZodDefault<z.ZodString>;
    SESSION_COOKIE_SECRET: z.ZodDefault<z.ZodString>;
    SESSION_TTL_HOURS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    WEB_ORIGIN: z.ZodDefault<z.ZodString>;
    CORS_ALLOWED_ORIGINS: z.ZodDefault<z.ZodString>;
    RATE_LIMIT_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    RATE_LIMIT_TIME_WINDOW: z.ZodDefault<z.ZodString>;
    AUTH_RATE_LIMIT_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    AUTH_RATE_LIMIT_TIME_WINDOW: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
export declare const config: Env;
export default config;
