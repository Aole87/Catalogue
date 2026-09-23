"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentSchema = exports.rejectSlipSchema = exports.verifySlipSchema = exports.submitSlipSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid('Invalid order UUID format'),
    provider: zod_1.z.enum(['PROMPTPAY', 'BANK_TRANSFER', 'TEST', 'COD']).default('PROMPTPAY'),
    method: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().max(100).optional(),
});
exports.submitSlipSchema = zod_1.z.object({
    slipUrl: zod_1.z.string().min(1, 'Slip URL is required'),
    bankName: zod_1.z.string().max(100).optional(),
    transferAmount: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid transfer amount format').optional(),
    transferredAt: zod_1.z.string().datetime().or(zod_1.z.string()).optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.verifySlipSchema = zod_1.z.object({
    verifiedAmount: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid verified amount format').optional(),
    note: zod_1.z.string().max(500).optional(),
});
exports.rejectSlipSchema = zod_1.z.object({
    rejectionReason: zod_1.z.string().min(3, 'Rejection reason must be at least 3 characters'),
});
exports.refundPaymentSchema = zod_1.z.object({
    amount: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a positive decimal number e.g. 1500.00'),
    reason: zod_1.z.string().min(3, 'Reason must be at least 3 characters'),
});
//# sourceMappingURL=payment.schema.js.map