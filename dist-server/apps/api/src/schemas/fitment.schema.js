"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantProductsQuerySchema = exports.checkFitmentQuerySchema = exports.checkFitmentParamSchema = exports.updateFitmentSchema = exports.createFitmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createFitmentSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Product ID must be a valid UUID').optional(), // can be in URL or body
    vehicleVariantId: zod_1.z.string().uuid('Vehicle Variant ID must be a valid UUID'),
    position: zod_1.z.string().max(50).default('ALL').optional(),
    notes: zod_1.z.string().max(255).nullable().optional(),
    fitmentStatus: zod_1.z.nativeEnum(client_1.FitmentStatus).default(client_1.FitmentStatus.COMPATIBLE).optional(),
});
exports.updateFitmentSchema = zod_1.z.object({
    position: zod_1.z.string().max(50).optional(),
    notes: zod_1.z.string().max(255).nullable().optional(),
    fitmentStatus: zod_1.z.nativeEnum(client_1.FitmentStatus).optional(),
});
exports.checkFitmentParamSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Product ID must be a valid UUID'),
    vehicleVariantId: zod_1.z.string().uuid('Vehicle Variant ID must be a valid UUID'),
});
exports.checkFitmentQuerySchema = zod_1.z.object({
    position: zod_1.z.string().max(50).optional(),
});
exports.variantProductsQuerySchema = zod_1.z.object({
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
    brandId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().max(100).optional(),
    sortBy: zod_1.z.enum(['name', 'price', 'createdAt', 'updatedAt', 'sku']).default('createdAt').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
});
//# sourceMappingURL=fitment.schema.js.map