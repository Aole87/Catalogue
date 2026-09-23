import { z } from 'zod';
export declare const loyaltyAccountQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodString>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
export declare const adjustLoyaltyPointsSchema: z.ZodObject<{
    points: z.ZodNumber;
    reason: z.ZodString;
    referenceId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const redeemLoyaltySchema: z.ZodObject<{
    points: z.ZodNumber;
    subtotal: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
