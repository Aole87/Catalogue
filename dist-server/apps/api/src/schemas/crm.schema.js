"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSegmentSchema = exports.createSegmentSchema = exports.createTagSchema = exports.updateAdminCustomerSchema = exports.updateCustomerMeSchema = exports.customerQuerySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.customerQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    customerType: zod_1.z.nativeEnum(client_1.CustomerType).optional(),
    segmentId: zod_1.z.string().uuid().optional(),
    tagId: zod_1.z.string().uuid().optional(),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
    sortBy: zod_1.z.enum(['createdAt', 'lifetimeValue', 'orderCount', 'lastOrderDate']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
exports.updateCustomerMeSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(100).optional(),
    lastName: zod_1.z.string().min(1).max(100).optional(),
    displayName: zod_1.z.string().max(100).optional().nullable(),
    phone: zod_1.z.string().max(50).optional().nullable(),
    companyName: zod_1.z.string().max(200).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
});
exports.updateAdminCustomerSchema = zod_1.z.object({
    customerType: zod_1.z.nativeEnum(client_1.CustomerType).optional(),
    companyName: zod_1.z.string().max(200).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
    phone: zod_1.z.string().max(50).optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
    firstName: zod_1.z.string().max(100).optional(),
    lastName: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email().optional(),
});
exports.createTagSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Tag name is required').max(50),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color e.g. #3B82F6').optional(),
    description: zod_1.z.string().max(255).optional().nullable(),
});
exports.createSegmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Segment name is required').max(100),
    code: zod_1.z.string().min(1, 'Segment code is required').max(50),
    description: zod_1.z.string().max(255).optional().nullable(),
    isActive: zod_1.z.boolean().optional().default(true),
    isAutomatic: zod_1.z.boolean().optional().default(true),
    rules: zod_1.z
        .array(zod_1.z.object({
        field: zod_1.z.string().min(1),
        operator: zod_1.z.enum([
            'EQUALS',
            'NOT_EQUALS',
            'GREATER_THAN',
            'GREATER_THAN_OR_EQUAL',
            'LESS_THAN',
            'LESS_THAN_OR_EQUAL',
            'CONTAINS',
        ]),
        value: zod_1.z.string().min(1),
    }))
        .optional(),
});
exports.updateSegmentSchema = exports.createSegmentSchema.partial();
//# sourceMappingURL=crm.schema.js.map