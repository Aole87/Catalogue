"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movementQuerySchema = exports.returnDispositionSchema = exports.transferStockSchema = exports.adjustStockSchema = exports.reserveStockSchema = exports.inventoryQuerySchema = exports.updateLocationSchema = exports.createLocationSchema = exports.updateWarehouseSchema = exports.createWarehouseSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createWarehouseSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(50),
    name: zod_1.z.string().min(2).max(255),
    description: zod_1.z.string().optional(),
    addressLine1: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateWarehouseSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255).optional(),
    description: zod_1.z.string().optional(),
    addressLine1: zod_1.z.string().optional(),
    district: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createLocationSchema = zod_1.z.object({
    warehouseId: zod_1.z.string().uuid(),
    code: zod_1.z.string().min(2).max(50),
    name: zod_1.z.string().min(2).max(255),
    zone: zod_1.z.string().optional(),
    rack: zod_1.z.string().optional(),
    shelf: zod_1.z.string().optional(),
    bin: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateLocationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255).optional(),
    zone: zod_1.z.string().optional(),
    rack: zod_1.z.string().optional(),
    shelf: zod_1.z.string().optional(),
    bin: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.inventoryQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    productId: zod_1.z.string().uuid().optional(),
    warehouseId: zod_1.z.string().uuid().optional(),
    locationId: zod_1.z.string().uuid().optional(),
    lowStock: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    stockStatus: zod_1.z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20)),
    sortBy: zod_1.z.enum(['productName', 'sku', 'onHand', 'reserved', 'available', 'updatedAt']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
exports.reserveStockSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid().optional(),
    productId: zod_1.z.string().uuid(),
    warehouseId: zod_1.z.string().uuid().optional(),
    quantity: zod_1.z.number().int().positive('Quantity must be greater than 0'),
    referenceType: zod_1.z.string().optional(),
    referenceId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
});
exports.adjustStockSchema = zod_1.z.object({
    warehouseId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    locationId: zod_1.z.string().uuid().optional(),
    direction: zod_1.z.enum(['INCREASE', 'DECREASE', 'SET']),
    quantity: zod_1.z.number().int().min(0, 'Quantity must be non-negative'),
    reason: zod_1.z.string().min(3, 'Adjustment reason must be at least 3 characters'),
    notes: zod_1.z.string().optional(),
});
exports.transferStockSchema = zod_1.z.object({
    sourceWarehouseId: zod_1.z.string().uuid(),
    targetWarehouseId: zod_1.z.string().uuid(),
    sourceLocationId: zod_1.z.string().uuid().optional(),
    targetLocationId: zod_1.z.string().uuid().optional(),
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive('Transfer quantity must be greater than 0'),
    reason: zod_1.z.string().min(3, 'Transfer reason must be at least 3 characters'),
    notes: zod_1.z.string().optional(),
});
exports.returnDispositionSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid().optional(),
    productId: zod_1.z.string().uuid(),
    warehouseId: zod_1.z.string().uuid(),
    locationId: zod_1.z.string().uuid().optional(),
    quantity: zod_1.z.number().int().positive('Disposition quantity must be greater than 0'),
    disposition: zod_1.z.enum(['RESTOCK', 'DAMAGED', 'QUARANTINE', 'SCRAP']),
    notes: zod_1.z.string().optional(),
});
exports.movementQuerySchema = zod_1.z.object({
    productId: zod_1.z.string().uuid().optional(),
    warehouseId: zod_1.z.string().uuid().optional(),
    movementType: zod_1.z.nativeEnum(client_1.InventoryMovementType).optional(),
    referenceType: zod_1.z.string().optional(),
    referenceId: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    dateTo: zod_1.z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 20)),
});
//# sourceMappingURL=inventory.schema.js.map