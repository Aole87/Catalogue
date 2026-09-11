import { z } from 'zod';
import { FitmentStatus } from '@prisma/client';

export const createFitmentSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID').optional(), // can be in URL or body
  vehicleVariantId: z.string().uuid('Vehicle Variant ID must be a valid UUID'),
  position: z.string().max(50).default('ALL').optional(),
  notes: z.string().max(255).nullable().optional(),
  fitmentStatus: z.nativeEnum(FitmentStatus).default(FitmentStatus.COMPATIBLE).optional(),
});

export const updateFitmentSchema = z.object({
  position: z.string().max(50).optional(),
  notes: z.string().max(255).nullable().optional(),
  fitmentStatus: z.nativeEnum(FitmentStatus).optional(),
});

export const checkFitmentParamSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  vehicleVariantId: z.string().uuid('Vehicle Variant ID must be a valid UUID'),
});

export const checkFitmentQuerySchema = z.object({
  position: z.string().max(50).optional(),
});

export const variantProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z
    .coerce
    .number()
    .int()
    .min(1)
    .default(20)
    .transform((val) => Math.min(100, Math.max(1, val)))
    .optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt', 'sku']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreateFitmentInput = z.infer<typeof createFitmentSchema>;
export type UpdateFitmentInput = z.infer<typeof updateFitmentSchema>;
export type CheckFitmentParams = z.infer<typeof checkFitmentParamSchema>;
export type CheckFitmentQuery = z.infer<typeof checkFitmentQuerySchema>;
export type VariantProductsQuery = z.infer<typeof variantProductsQuerySchema>;
