import { z } from 'zod';
import { PriceTier, ProductReferenceType } from '@prisma/client';

export const productPriceInputSchema = z.object({
  tier: z.nativeEnum(PriceTier),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  costPrice: z.coerce.number().min(0).nullable().optional(),
  currency: z.string().default('THB').optional(),
});

export const productImageInputSchema = z.object({
  url: z.string().min(1, 'Image URL must be valid'),
  altText: z.string().max(255).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
  isPrimary: z.boolean().default(false).optional(),
});

export const productAttributeInputSchema = z.object({
  attributeId: z.string().uuid('Attribute ID must be a valid UUID'),
  value: z.string().min(1, 'Attribute value is required').max(255),
});

export const productCrossReferenceInputSchema = z.object({
  referenceType: z.nativeEnum(ProductReferenceType).default(ProductReferenceType.OEM),
  referenceNumber: z.string().min(1, 'Reference number is required').max(100),
  brandId: z.string().uuid('Brand ID must be a valid UUID').nullable().optional(),
  notes: z.string().max(255).nullable().optional(),
});

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(100)
    .regex(/^[A-Za-z0-9_\-\.\/]+$/, 'SKU contains invalid characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1, 'Product name is required').max(255),
  shortDescription: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  brandId: z.string().uuid('Brand ID must be a valid UUID'),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  barcode: z.string().max(100).nullable().optional(),
  warrantyText: z.string().max(255).nullable().optional(),
  weightGrams: z.number().int().min(0).nullable().optional(),
  lengthMm: z.number().int().min(0).nullable().optional(),
  widthMm: z.number().int().min(0).nullable().optional(),
  heightMm: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().default(true).optional(),
  isPublished: z.boolean().default(true).optional(),
  prices: z.array(productPriceInputSchema).optional(),
  images: z.array(productImageInputSchema).optional(),
  attributes: z.array(productAttributeInputSchema).optional(),
  crossReferences: z.array(productCrossReferenceInputSchema).optional(),
});

export const updateProductSchema = z.object({
  sku: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9_\-\.\/]+$/, 'SKU contains invalid characters')
    .optional(),
  slug: z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  name: z.string().min(1).max(255).optional(),
  shortDescription: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  brandId: z.string().uuid('Brand ID must be a valid UUID').optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
  barcode: z.string().max(100).nullable().optional(),
  warrantyText: z.string().max(255).nullable().optional(),
  weightGrams: z.number().int().min(0).nullable().optional(),
  lengthMm: z.number().int().min(0).nullable().optional(),
  widthMm: z.number().int().min(0).nullable().optional(),
  heightMm: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  prices: z.array(productPriceInputSchema).optional(),
  images: z.array(productImageInputSchema).optional(),
  attributes: z.array(productAttributeInputSchema).optional(),
  crossReferences: z.array(productCrossReferenceInputSchema).optional(),
});

export const updateProductPricesSchema = z.object({
  prices: z
    .array(productPriceInputSchema)
    .min(1, 'At least one pricing tier must be specified'),
});

export const productQuerySchema = z.object({
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
  category: z.string().optional(), // slug or UUID
  brandId: z.string().uuid().optional(),
  brand: z.string().optional(), // slug or UUID
  vehicleVariantId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(100).optional(),
  q: z.string().max(100).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt', 'sku']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  isActive: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductPricesInput = z.infer<typeof updateProductPricesSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
