"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPurchaseOrderSchema = exports.rejectPurchaseOrderSchema = exports.approvePurchaseOrderSchema = exports.updatePurchaseOrderSchema = exports.createPurchaseOrderSchema = exports.createPurchaseOrderItemSchema = exports.purchaseOrderQuerySchema = void 0;
const zod_1 = require("zod");
const database_1 = require("@car-parts/database");
exports.purchaseOrderQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(database_1.PurchaseOrderStatus).optional(),
    supplierId: zod_1.z.string().uuid().optional(),
    destinationWarehouseId: zod_1.z.string().uuid().optional(),
    warehouseId: zod_1.z.string().uuid().optional(),
    poNumber: zod_1.z.string().optional(),
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
    sortBy: zod_1.z.enum(['createdAt', 'expectedDeliveryDate', 'grandTotal', 'poNumber', 'status']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
exports.createPurchaseOrderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Invalid product UUID'),
    supplierProductId: zod_1.z.string().uuid().optional().nullable(),
    orderedQuantity: zod_1.z.number().int().min(1, 'Ordered quantity must be at least 1').optional(),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').optional(),
    unitCost: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    discount: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    tax: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    notes: zod_1.z.string().optional().nullable(),
}).transform((data) => ({
    ...data,
    orderedQuantity: data.orderedQuantity ?? data.quantity ?? 1,
}));
exports.createPurchaseOrderSchema = zod_1.z.object({
    supplierId: zod_1.z.string().uuid('Invalid supplier UUID'),
    destinationWarehouseId: zod_1.z.string().uuid('Invalid warehouse UUID').optional(),
    warehouseId: zod_1.z.string().uuid('Invalid warehouse UUID').optional(),
    currency: zod_1.z.string().max(10).optional().default('THB'),
    taxRate: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    shippingCost: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    otherCost: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    notes: zod_1.z.string().optional().nullable(),
    termsAndConditions: zod_1.z.string().optional().nullable(),
    expectedDeliveryDate: zod_1.z.string().optional().nullable(),
    items: zod_1.z.array(exports.createPurchaseOrderItemSchema).min(1, 'At least one line item is required'),
}).transform((data) => {
    const destinationWarehouseId = data.destinationWarehouseId || data.warehouseId;
    if (!destinationWarehouseId) {
        throw new Error('Destination warehouse is required');
    }
    return {
        ...data,
        destinationWarehouseId,
    };
});
exports.updatePurchaseOrderSchema = zod_1.z.object({
    destinationWarehouseId: zod_1.z.string().uuid('Invalid warehouse UUID').optional(),
    warehouseId: zod_1.z.string().uuid('Invalid warehouse UUID').optional(),
    shippingCost: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    otherCost: zod_1.z.union([zod_1.z.number().min(0), zod_1.z.string()]).optional(),
    notes: zod_1.z.string().optional().nullable(),
    termsAndConditions: zod_1.z.string().optional().nullable(),
    expectedDeliveryDate: zod_1.z.string().optional().nullable(),
});
exports.approvePurchaseOrderSchema = zod_1.z.object({
    overrideReason: zod_1.z.string().optional(),
});
exports.rejectPurchaseOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().optional(),
}).transform((data) => ({
    reason: data.reason || data.rejectionReason || 'Rejected by procurement management',
}));
exports.cancelPurchaseOrderSchema = zod_1.z.object({
    reason: zod_1.z.string().optional(),
    cancellationReason: zod_1.z.string().optional(),
}).transform((data) => ({
    reason: data.reason || data.cancellationReason || 'Cancelled by procurement management',
}));
//# sourceMappingURL=purchase-order.schema.js.map