"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCouponSchema = exports.updateCouponSchema = exports.createCouponSchema = exports.couponQuerySchema = exports.updatePromotionSchema = exports.createPromotionSchema = exports.promotionQuerySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.promotionQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.PromotionStatus).optional(),
    promotionType: zod_1.z.nativeEnum(client_1.PromotionType).optional(),
    activeOnly: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .optional()
        .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});
exports.createPromotionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Promotion name is required').max(100),
    code: zod_1.z.string().max(50).optional().nullable(),
    description: zod_1.z.string().max(500).optional().nullable(),
    promotionType: zod_1.z.nativeEnum(client_1.PromotionType).default(client_1.PromotionType.PERCENTAGE),
    status: zod_1.z.nativeEnum(client_1.PromotionStatus).default(client_1.PromotionStatus.DRAFT),
    startsAt: zod_1.z
        .preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().datetime().optional().nullable())
        .transform((val) => (val ? new Date(val) : null)),
    endsAt: zod_1.z
        .preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().datetime().optional().nullable())
        .transform((val) => (val ? new Date(val) : null)),
    priority: zod_1.z.number().int().min(0).default(0),
    stackable: zod_1.z.boolean().default(false),
    minimumOrderAmount: zod_1.z.number().min(0).default(0),
    discountValue: zod_1.z.number().min(0, 'Discount value must be non-negative'),
    maximumDiscountAmount: zod_1.z.number().min(0).optional().nullable(),
    usageLimit: zod_1.z.number().int().min(1).optional().nullable(),
    perCustomerLimit: zod_1.z.number().int().min(1).optional().nullable(),
    productIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    brandIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    rules: zod_1.z
        .array(zod_1.z.object({
        ruleType: zod_1.z.string().min(1),
        ruleValue: zod_1.z.any().optional(),
    }))
        .optional(),
});
exports.updatePromotionSchema = exports.createPromotionSchema.partial();
exports.couponQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    promotionId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .optional()
        .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});
exports.createCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Coupon code is required').max(50),
    promotionId: zod_1.z.string().uuid('Valid promotion ID is required'),
    usageLimit: zod_1.z.number().int().min(1).optional().nullable(),
    perCustomerLimit: zod_1.z.number().int().min(1).optional().nullable(),
    startsAt: zod_1.z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    endsAt: zod_1.z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50).optional(),
    usageLimit: zod_1.z.number().int().min(1).optional().nullable(),
    perCustomerLimit: zod_1.z.number().int().min(1).optional().nullable(),
    startsAt: zod_1.z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    endsAt: zod_1.z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    isActive: zod_1.z.boolean().optional(),
});
exports.validateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Coupon code is required'),
    subtotal: zod_1.z.number().min(0).optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().min(1),
        lineTotal: zod_1.z.number().min(0),
    }))
        .optional(),
});
//# sourceMappingURL=promotion.schema.js.map