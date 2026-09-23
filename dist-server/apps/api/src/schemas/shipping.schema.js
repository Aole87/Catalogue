"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminShipmentQuerySchema = exports.cancelShipmentSchema = exports.assignTrackingSchema = exports.updateShipmentStatusSchema = exports.createShipmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createShipmentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid('Invalid order UUID format'),
    shippingMethodId: zod_1.z.string().uuid('Invalid shipping method UUID format').optional(),
    carrier: zod_1.z.string().max(100).optional(),
    serviceLevel: zod_1.z.string().max(50).optional(),
    recipientName: zod_1.z.string().max(255).optional(),
    phone: zod_1.z.string().max(50).optional(),
    addressLine1: zod_1.z.string().max(255).optional(),
    addressLine2: zod_1.z.string().max(255).optional(),
    subdistrict: zod_1.z.string().max(100).optional(),
    district: zod_1.z.string().max(100).optional(),
    province: zod_1.z.string().max(100).optional(),
    postalCode: zod_1.z.string().max(20).optional(),
    country: zod_1.z.string().max(10).optional(),
});
exports.updateShipmentStatusSchema = zod_1.z.object({
    toStatus: zod_1.z.nativeEnum(client_1.ShipmentStatus, {
        message: 'Invalid shipment status value',
    }),
    description: zod_1.z.string().max(500).optional(),
    location: zod_1.z.string().max(255).optional(),
    occurredAt: zod_1.z.string().datetime().or(zod_1.z.string()).optional(),
});
exports.assignTrackingSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().min(3, 'Tracking number must be at least 3 characters'),
    carrier: zod_1.z.string().max(100).optional(),
    serviceLevel: zod_1.z.string().max(50).optional(),
});
exports.cancelShipmentSchema = zod_1.z.object({
    reason: zod_1.z.string().min(3, 'Cancellation reason must be at least 3 characters'),
});
exports.adminShipmentQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ShipmentStatus).optional(),
    carrier: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=shipping.schema.js.map