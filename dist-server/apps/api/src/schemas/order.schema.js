"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrderQuerySchema = exports.customerOrderQuerySchema = exports.updateOrderStatusSchema = exports.returnActionSchema = exports.returnOrderSchema = exports.cancelOrderSchema = exports.checkoutSchema = exports.shippingAddressSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.shippingAddressSchema = zod_1.z.object({
    recipientName: zod_1.z.string().min(1, 'Recipient name is required').max(100),
    phone: zod_1.z.string().min(8, 'Phone number is required').max(20),
    addressLine: zod_1.z.string().min(1, 'Address line is required').max(255),
    subdistrict: zod_1.z.string().max(100).optional(),
    district: zod_1.z.string().max(100).optional(),
    province: zod_1.z.string().min(1, 'Province is required').max(100),
    postalCode: zod_1.z.string().min(4, 'Postal code is required').max(10),
});
exports.checkoutSchema = zod_1.z.object({
    shippingAddress: exports.shippingAddressSchema,
    customerNotes: zod_1.z.string().max(500).optional(),
    paymentMethod: zod_1.z.enum(['PROMPTPAY', 'BANK_TRANSFER', 'COD', 'CREDIT_CARD']).default('PROMPTPAY').optional(),
    couponCode: zod_1.z.string().max(50).optional(),
    loyaltyPointsToRedeem: zod_1.z.number().int().min(0).optional(),
});
exports.cancelOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().min(3, 'Cancellation reason must be at least 3 characters').max(500),
});
exports.returnOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().min(3, 'Return reason must be at least 3 characters').max(500),
    notes: zod_1.z.string().max(500).optional(),
});
exports.returnActionSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REJECT'], {
        message: "Action must be 'APPROVE' or 'REJECT'",
    }),
    note: zod_1.z.string().max(500).optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    toStatus: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    note: zod_1.z.string().max(500).optional(),
}).transform((data) => ({
    toStatus: data.toStatus || data.status || client_1.OrderStatus.PENDING_PAYMENT,
    note: data.note,
}));
exports.customerOrderQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    q: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().or(zod_1.z.string()).optional(),
    dateTo: zod_1.z.string().datetime().or(zod_1.z.string()).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).default(20).transform((v) => Math.min(v, 100)),
});
exports.adminOrderQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.OrderStatus).optional(),
    paymentStatus: zod_1.z.nativeEnum(client_1.PaymentStatus).optional(),
    shipmentStatus: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().or(zod_1.z.string()).optional(),
    dateTo: zod_1.z.string().datetime().or(zod_1.z.string()).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'orderNumber', 'grandTotal', 'totalAmount', 'status']).default('createdAt').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).default(20).transform((v) => Math.min(v, 100)),
});
//# sourceMappingURL=order.schema.js.map