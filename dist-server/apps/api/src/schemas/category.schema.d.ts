import { z } from 'zod';
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodPreprocess<z.ZodString, unknown>;
    parentId: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    description: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    imageUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodPreprocess<z.ZodString, unknown>>;
    parentId: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    description: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    imageUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
