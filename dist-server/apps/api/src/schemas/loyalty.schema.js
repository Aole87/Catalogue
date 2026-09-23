"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemLoyaltySchema = exports.adjustLoyaltyPointsSchema = exports.loyaltyAccountQuerySchema = void 0;
const zod_1 = require("zod");
exports.loyaltyAccountQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    tier: zod_1.z.string().optional(),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});
exports.adjustLoyaltyPointsSchema = zod_1.z.object({
    points: zod_1.z.number().int().refine((val) => val !== 0, 'Points adjustment cannot be 0'),
    reason: zod_1.z.string().min(1, 'Reason for adjustment is mandatory for financial audit').max(255),
    referenceId: zod_1.z.string().max(100).optional().nullable(),
});
exports.redeemLoyaltySchema = zod_1.z.object({
    points: zod_1.z.number().int().min(1, 'Points to redeem must be at least 1'),
    subtotal: zod_1.z.number().min(0).optional(),
});
//# sourceMappingURL=loyalty.schema.js.map