import { z } from 'zod';
export declare const createBrandSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodPreprocess<z.ZodString, unknown>;
    description: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    logoUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    websiteUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateBrandSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodPreprocess<z.ZodString, unknown>>;
    description: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    logoUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    websiteUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
