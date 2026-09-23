"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupplierProductSchema = exports.createSupplierProductSchema = exports.supplierProductQuerySchema = exports.updateSupplierSchema = exports.createSupplierSchema = exports.supplierQuerySchema = void 0;
const zod_1 = require("zod");
exports.supplierQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    code: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    isActive: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .optional()
        .transform((val) => {
        if (val === undefined)
            return undefined;
        if (typeof val === 'boolean')
            return val;
        return val === 'true';
    }),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    offset: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
    sortBy: zod_1.z.enum(['name', 'code', 'createdAt', 'updatedAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
}).transform((data) => ({
    ...data,
    q: data.q || data.search,
}));
exports.createSupplierSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Supplier code is required').max(50),
    name: zod_1.z.string().min(1, 'Supplier name is required').max(200),
    displayName: zod_1.z.string().max(200).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
    contactName: zod_1.z.string().max(100).optional().nullable(),
    email: zod_1.z.string().email('Invalid email address').optional().nullable(),
    phone: zod_1.z.string().max(50).optional().nullable(),
    addressLine1: zod_1.z.string().max(255).optional().nullable(),
    addressLine2: zod_1.z.string().max(255).optional().nullable(),
    subdistrict: zod_1.z.string().max(100).optional().nullable(),
    district: zod_1.z.string().max(100).optional().nullable(),
    province: zod_1.z.string().max(100).optional().nullable(),
    postalCode: zod_1.z.string().max(20).optional().nullable(),
    country: zod_1.z.string().max(10).optional().default('TH'),
    paymentTerms: zod_1.z.string().max(50).optional().nullable(),
    currency: zod_1.z.string().max(10).optional().default('THB'),
    leadTimeDays: zod_1.z.number().int().min(0).optional().nullable(),
    isActive: zod_1.z.boolean().optional().default(true),
    notes: zod_1.z.string().optional().nullable(),
});
exports.updateSupplierSchema = exports.createSupplierSchema.partial();
exports.supplierProductQuerySchema = zod_1.z.object({
    supplierId: zod_1.z.string().uuid().optional(),
    productId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .optional()
        .transform((val) => {
        if (val === undefined)
            return undefined;
        if (typeof val === 'boolean')
            return val;
        return val === 'true';
    }),
    isPreferred: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .optional()
        .transform((val) => {
        if (val === undefined)
            return undefined;
        if (typeof val === 'boolean')
            return val;
        return val === 'true';
    }),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});
exports.createSupplierProductSchema = zod_1.z.object({
    supplierId: zod_1.z.string().uuid('Invalid supplier UUID').optional(),
    productId: zod_1.z.string().uuid('Invalid product UUID'),
    supplierSku: zod_1.z.string().max(100).optional().nullable(),
    purchaseCost: zod_1.z.union([zod_1.z.number().min(0, 'Purchase cost must be non-negative'), zod_1.z.string()]),
    currency: zod_1.z.string().max(10).optional().default('THB'),
    moq: zod_1.z.number().int().min(1, 'MOQ must be at least 1').optional().default(1),
    packSize: zod_1.z.number().int().min(1, 'Pack size must be at least 1').optional().default(1),
    leadTimeDays: zod_1.z.number().int().min(0).optional().nullable(),
    isPreferred: zod_1.z.boolean().optional().default(false),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateSupplierProductSchema = zod_1.z.object({
    supplierSku: zod_1.z.string().max(100).optional().nullable(),
    purchaseCost: zod_1.z.union([zod_1.z.number().min(0, 'Purchase cost must be non-negative'), zod_1.z.string()]).optional(),
    currency: zod_1.z.string().max(10).optional(),
    moq: zod_1.z.number().int().min(1, 'MOQ must be at least 1').optional(),
    packSize: zod_1.z.number().int().min(1, 'Pack size must be at least 1').optional(),
    leadTimeDays: zod_1.z.number().int().min(0).optional().nullable(),
    isPreferred: zod_1.z.boolean().optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=supplier.schema.js.map