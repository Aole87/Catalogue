"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.updateProductPricesSchema = exports.updateProductSchema = exports.createProductSchema = exports.productCrossReferenceInputSchema = exports.productAttributeInputSchema = exports.productImageInputSchema = exports.productPriceInputSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.productPriceInputSchema = zod_1.z.object({
    tier: zod_1.z.nativeEnum(client_1.PriceTier),
    price: zod_1.z.coerce.number().min(0, 'Price must be non-negative'),
    compareAtPrice: zod_1.z.coerce.number().min(0).nullable().optional(),
    costPrice: zod_1.z.coerce.number().min(0).nullable().optional(),
    currency: zod_1.z.string().default('THB').optional(),
});
exports.productImageInputSchema = zod_1.z.object({
    url: zod_1.z.string().min(1, 'Image URL must be valid'),
    altText: zod_1.z.string().max(255).nullable().optional(),
    sortOrder: zod_1.z.number().int().min(0).default(0).optional(),
    isPrimary: zod_1.z.boolean().default(false).optional(),
});
exports.productAttributeInputSchema = zod_1.z.object({
    attributeId: zod_1.z.string().uuid('Attribute ID must be a valid UUID'),
    value: zod_1.z.string().min(1, 'Attribute value is required').max(255),
});
exports.productCrossReferenceInputSchema = zod_1.z.object({
    referenceType: zod_1.z.nativeEnum(client_1.ProductReferenceType).default(client_1.ProductReferenceType.OEM),
    referenceNumber: zod_1.z.string().min(1, 'Reference number is required').max(100),
    brandId: zod_1.z.string().uuid('Brand ID must be a valid UUID').nullable().optional(),
    notes: zod_1.z.string().max(255).nullable().optional(),
});
exports.createProductSchema = zod_1.z.object({
    sku: zod_1.z
        .string()
        .min(1, 'SKU is required')
        .max(100)
        .regex(/^[A-Za-z0-9_\-\.\/]+$/, 'SKU contains invalid characters'),
    slug: zod_1.z
        .string()
        .min(1, 'Slug is required')
        .max(150)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
    name: zod_1.z.string().min(1, 'Product name is required').max(255),
    shortDescription: zod_1.z.string().max(500).nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    brandId: zod_1.z.string().uuid('Brand ID must be a valid UUID'),
    categoryId: zod_1.z.string().uuid('Category ID must be a valid UUID'),
    barcode: zod_1.z.string().max(100).nullable().optional(),
    warrantyText: zod_1.z.string().max(255).nullable().optional(),
    weightGrams: zod_1.z.number().int().min(0).nullable().optional(),
    lengthMm: zod_1.z.number().int().min(0).nullable().optional(),
    widthMm: zod_1.z.number().int().min(0).nullable().optional(),
    heightMm: zod_1.z.number().int().min(0).nullable().optional(),
    isActive: zod_1.z.boolean().default(true).optional(),
    isPublished: zod_1.z.boolean().default(true).optional(),
    prices: zod_1.z.array(exports.productPriceInputSchema).optional(),
    images: zod_1.z.array(exports.productImageInputSchema).optional(),
    attributes: zod_1.z.array(exports.productAttributeInputSchema).optional(),
    crossReferences: zod_1.z.array(exports.productCrossReferenceInputSchema).optional(),
});
exports.updateProductSchema = zod_1.z.object({
    sku: zod_1.z
        .string()
        .min(1)
        .max(100)
        .regex(/^[A-Za-z0-9_\-\.\/]+$/, 'SKU contains invalid characters')
        .optional(),
    slug: zod_1.z
        .string()
        .min(1)
        .max(150)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
        .optional(),
    name: zod_1.z.string().min(1).max(255).optional(),
    shortDescription: zod_1.z.string().max(500).nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    brandId: zod_1.z.string().uuid('Brand ID must be a valid UUID').optional(),
    categoryId: zod_1.z.string().uuid('Category ID must be a valid UUID').optional(),
    barcode: zod_1.z.string().max(100).nullable().optional(),
    warrantyText: zod_1.z.string().max(255).nullable().optional(),
    weightGrams: zod_1.z.number().int().min(0).nullable().optional(),
    lengthMm: zod_1.z.number().int().min(0).nullable().optional(),
    widthMm: zod_1.z.number().int().min(0).nullable().optional(),
    heightMm: zod_1.z.number().int().min(0).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
    isPublished: zod_1.z.boolean().optional(),
    prices: zod_1.z.array(exports.productPriceInputSchema).optional(),
    images: zod_1.z.array(exports.productImageInputSchema).optional(),
    attributes: zod_1.z.array(exports.productAttributeInputSchema).optional(),
    crossReferences: zod_1.z.array(exports.productCrossReferenceInputSchema).optional(),
});
exports.updateProductPricesSchema = zod_1.z.object({
    prices: zod_1.z
        .array(exports.productPriceInputSchema)
        .min(1, 'At least one pricing tier must be specified'),
});
exports.productQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1).optional(),
    pageSize: zod_1.z
        .coerce
        .number()
        .int()
        .min(1)
        .default(20)
        .transform((val) => Math.min(100, Math.max(1, val)))
        .optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    category: zod_1.z.string().optional(), // slug or UUID
    brandId: zod_1.z.string().uuid().optional(),
    brand: zod_1.z.string().optional(), // slug or UUID
    vehicleVariantId: zod_1.z.string().uuid().optional(),
    minPrice: zod_1.z.coerce.number().min(0).optional(),
    maxPrice: zod_1.z.coerce.number().min(0).optional(),
    search: zod_1.z.string().max(100).optional(),
    q: zod_1.z.string().max(100).optional(),
    sortBy: zod_1.z.enum(['name', 'price', 'createdAt', 'updatedAt', 'sku']).default('createdAt').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
    isPublished: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=product.schema.js.map