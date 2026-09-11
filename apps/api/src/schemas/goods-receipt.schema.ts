import { z } from 'zod';

export const goodsReceiptQuerySchema = z.object({
  purchaseOrderId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  receiptNumber: z.string().optional(),
  dateFrom: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  dateTo: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});

export const receiveGoodsItemSchema = z.object({
  purchaseOrderItemId: z.string().uuid('Invalid PO Item UUID'),
  receivedQuantity: z.number().int().min(1, 'Received quantity must be at least 1'),
  acceptedQuantity: z.number().int().min(0).optional(),
  rejectedQuantity: z.number().int().min(0).optional(),
  rejectionReason: z.string().optional().nullable(),
  rejectionNotes: z.string().optional().nullable(),
}).transform((data) => ({
  ...data,
  rejectionReason: data.rejectionReason || data.rejectionNotes || null,
}));

export const receiveGoodsSchema = z.object({
  purchaseOrderId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional().nullable(),
  warehouseLocationId: z.string().uuid().optional().nullable(),
  idempotencyKey: z.string().max(100).optional().nullable(),
  invoiceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(receiveGoodsItemSchema).min(1, 'At least one line item must be received'),
}).transform((data) => ({
  ...data,
  locationId: data.locationId ?? data.warehouseLocationId ?? null,
}));
