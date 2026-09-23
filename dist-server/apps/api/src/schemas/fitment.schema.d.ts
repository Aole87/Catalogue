import { z } from 'zod';
export declare const createFitmentSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    vehicleVariantId: z.ZodString;
    position: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fitmentStatus: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        COMPATIBLE: "COMPATIBLE";
        INCOMPATIBLE: "INCOMPATIBLE";
        REQUIRES_VERIFICATION: "REQUIRES_VERIFICATION";
    }>>>;
}, z.core.$strip>;
export declare const updateFitmentSchema: z.ZodObject<{
    position: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fitmentStatus: z.ZodOptional<z.ZodEnum<{
        COMPATIBLE: "COMPATIBLE";
        INCOMPATIBLE: "INCOMPATIBLE";
        REQUIRES_VERIFICATION: "REQUIRES_VERIFICATION";
    }>>;
}, z.core.$strip>;
export declare const checkFitmentParamSchema: z.ZodObject<{
    productId: z.ZodString;
    vehicleVariantId: z.ZodString;
}, z.core.$strip>;
export declare const checkFitmentQuerySchema: z.ZodObject<{
    position: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const variantProductsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    pageSize: z.ZodOptional<z.ZodPipe<z.ZodDefault<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number>>>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        sku: "sku";
        price: "price";
    }>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export type CreateFitmentInput = z.infer<typeof createFitmentSchema>;
export type UpdateFitmentInput = z.infer<typeof updateFitmentSchema>;
export type CheckFitmentParams = z.infer<typeof checkFitmentParamSchema>;
export type CheckFitmentQuery = z.infer<typeof checkFitmentQuerySchema>;
export type VariantProductsQuery = z.infer<typeof variantProductsQuerySchema>;
