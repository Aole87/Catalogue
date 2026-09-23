"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveGoodsSchema = exports.receiveGoodsItemSchema = exports.goodsReceiptQuerySchema = void 0;
const zod_1 = require("zod");
exports.goodsReceiptQuerySchema = zod_1.z.object({
    purchaseOrderId: zod_1.z.string().uuid().optional(),
    warehouseId: zod_1.z.string().uuid().optional(),
    receiptNumber: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    dateTo: zod_1.z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});
exports.receiveGoodsItemSchema = zod_1.z.object({
    purchaseOrderItemId: zod_1.z.string().uuid('Invalid PO Item UUID'),
    receivedQuantity: zod_1.z.number().int().min(1, 'Received quantity must be at least 1'),
    acceptedQuantity: zod_1.z.number().int().min(0).optional(),
    rejectedQuantity: zod_1.z.number().int().min(0).optional(),
    rejectionReason: zod_1.z.string().optional().nullable(),
    rejectionNotes: zod_1.z.string().optional().nullable(),
}).transform((data) => ({
    ...data,
    rejectionReason: data.rejectionReason || data.rejectionNotes || null,
}));
exports.receiveGoodsSchema = zod_1.z.object({
    purchaseOrderId: zod_1.z.string().uuid().optional(),
    warehouseId: zod_1.z.string().uuid().optional(),
    locationId: zod_1.z.string().uuid().optional().nullable(),
    warehouseLocationId: zod_1.z.string().uuid().optional().nullable(),
    idempotencyKey: zod_1.z.string().max(100).optional().nullable(),
    invoiceNumber: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(exports.receiveGoodsItemSchema).min(1, 'At least one line item must be received'),
}).transform((data) => ({
    ...data,
    locationId: data.locationId ?? data.warehouseLocationId ?? null,
}));
//# sourceMappingURL=goods-receipt.schema.js.map