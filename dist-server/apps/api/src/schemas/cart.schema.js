"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeCartSchema = exports.updateCartItemSchema = exports.addCartItemSchema = void 0;
const zod_1 = require("zod");
exports.addCartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Product ID must be a valid UUID'),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999').default(1),
    vehicleVariantId: zod_1.z.string().uuid('Vehicle Variant ID must be a valid UUID').nullable().optional(),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(0, 'Quantity must be 0 or greater').max(999, 'Quantity cannot exceed 999'),
});
exports.mergeCartSchema = zod_1.z.object({
    sessionToken: zod_1.z.string().min(1, 'Session token is required'),
});
//# sourceMappingURL=cart.schema.js.map