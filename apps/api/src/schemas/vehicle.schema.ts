import { z } from 'zod';
import { FuelType } from '@prisma/client';

// ==========================================
// MAKES
// ==========================================
export const createVehicleMakeSchema = z.object({
  name: z.string().min(1, 'Make name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  countryOfOrigin: z.string().max(100).nullable().optional(),
  logoUrl: z.string().url('Logo URL must be valid').nullable().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateVehicleMakeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  countryOfOrigin: z.string().max(100).nullable().optional(),
  logoUrl: z.string().url('Logo URL must be valid').nullable().optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// MODELS
// ==========================================
export const createVehicleModelSchema = z.object({
  makeId: z.string().uuid('Make ID must be a valid UUID'),
  name: z.string().min(1, 'Model name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  isActive: z.boolean().default(true).optional(),
});

export const updateVehicleModelSchema = z.object({
  makeId: z.string().uuid('Make ID must be a valid UUID').optional(),
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  isActive: z.boolean().optional(),
});

// ==========================================
// GENERATIONS
// ==========================================
export const createVehicleGenerationSchema = z.object({
  modelId: z.string().uuid('Model ID must be a valid UUID'),
  name: z.string().min(1, 'Generation name is required').max(100),
  code: z.string().max(50).nullable().optional(),
  startYear: z.coerce.number().int().min(1900, 'Start year must be >= 1900').max(2100, 'Start year must be <= 2100'),
  endYear: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  isActive: z.boolean().default(true).optional(),
}).refine(
  (data) => data.endYear == null || data.endYear >= data.startYear,
  {
    message: 'End year cannot be before start year',
    path: ['endYear'],
  }
);

export const updateVehicleGenerationSchema = z.object({
  modelId: z.string().uuid('Model ID must be a valid UUID').optional(),
  name: z.string().min(1).max(100).optional(),
  code: z.string().max(50).nullable().optional(),
  startYear: z.coerce.number().int().min(1900).max(2100).optional(),
  endYear: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startYear != null && data.endYear != null) {
      return data.endYear >= data.startYear;
    }
    return true;
  },
  {
    message: 'End year cannot be before start year',
    path: ['endYear'],
  }
);

// ==========================================
// ENGINES
// ==========================================
export const createVehicleEngineSchema = z.object({
  engineCode: z.string().max(50).nullable().optional(),
  name: z.string().min(1, 'Engine name is required').max(100),
  displacementCc: z.coerce.number().int().min(0).nullable().optional(),
  cylinders: z.coerce.number().int().min(1).max(16).nullable().optional(),
  fuelType: z.nativeEnum(FuelType).default(FuelType.PETROL).optional(),
  aspiration: z.string().max(50).nullable().optional(),
});

export const updateVehicleEngineSchema = z.object({
  engineCode: z.string().max(50).nullable().optional(),
  name: z.string().min(1).max(100).optional(),
  displacementCc: z.coerce.number().int().min(0).nullable().optional(),
  cylinders: z.coerce.number().int().min(1).max(16).nullable().optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  aspiration: z.string().max(50).nullable().optional(),
});

// ==========================================
// VARIANTS
// ==========================================
export const createVehicleVariantSchema = z.object({
  generationId: z.string().uuid('Generation ID must be a valid UUID'),
  engineId: z.string().uuid('Engine ID must be a valid UUID').nullable().optional(),
  name: z.string().min(1, 'Variant name is required').max(150),
  transmission: z.string().max(50).nullable().optional(),
  bodyType: z.string().max(50).nullable().optional(),
  drivetrain: z.string().max(50).nullable().optional(),
  startYear: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  endYear: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  isActive: z.boolean().default(true).optional(),
}).refine(
  (data) => {
    if (data.startYear != null && data.endYear != null) {
      return data.endYear >= data.startYear;
    }
    return true;
  },
  {
    message: 'End year cannot be before start year',
    path: ['endYear'],
  }
);

export const updateVehicleVariantSchema = z.object({
  generationId: z.string().uuid('Generation ID must be a valid UUID').optional(),
  engineId: z.string().uuid('Engine ID must be a valid UUID').nullable().optional(),
  name: z.string().min(1).max(150).optional(),
  transmission: z.string().max(50).nullable().optional(),
  bodyType: z.string().max(50).nullable().optional(),
  drivetrain: z.string().max(50).nullable().optional(),
  startYear: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  endYear: z.coerce.number().int().min(1900).max(2100).nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startYear != null && data.endYear != null) {
      return data.endYear >= data.startYear;
    }
    return true;
  },
  {
    message: 'End year cannot be before start year',
    path: ['endYear'],
  }
);

// ==========================================
// QUERY FILTERS & PARAMETERS
// ==========================================
export const vehicleMakeQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
});

export const vehicleModelQuerySchema = z.object({
  makeId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const vehicleGenerationQuerySchema = z.object({
  modelId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const vehicleVariantQuerySchema = z.object({
  generationId: z.string().uuid().optional(),
  engineId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const vehicleParamSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

export type CreateVehicleMakeInput = z.infer<typeof createVehicleMakeSchema>;
export type UpdateVehicleMakeInput = z.infer<typeof updateVehicleMakeSchema>;
export type CreateVehicleModelInput = z.infer<typeof createVehicleModelSchema>;
export type UpdateVehicleModelInput = z.infer<typeof updateVehicleModelSchema>;
export type CreateVehicleGenerationInput = z.infer<typeof createVehicleGenerationSchema>;
export type UpdateVehicleGenerationInput = z.infer<typeof updateVehicleGenerationSchema>;
export type CreateVehicleEngineInput = z.infer<typeof createVehicleEngineSchema>;
export type UpdateVehicleEngineInput = z.infer<typeof updateVehicleEngineSchema>;
export type CreateVehicleVariantInput = z.infer<typeof createVehicleVariantSchema>;
export type UpdateVehicleVariantInput = z.infer<typeof updateVehicleVariantSchema>;
