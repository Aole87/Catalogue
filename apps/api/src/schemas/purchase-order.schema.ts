import { z } from 'zod';
import { PurchaseOrderStatus } from '@car-parts/database';

export const purchaseOrderQuerySchema = z.object({
  status: z.nativeEnum(PurchaseOrderStatus).optional(),
  supplierId: z.string().uuid().optional(),
  destinationWarehouseId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  poNumber: z.string().optional(),
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
  sortBy: z.enum(['createdAt', 'expectedDeliveryDate', 'grandTotal', 'poNumber', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createPurchaseOrderItemSchema = z.object({
  productId: z.string().uuid('Invalid product UUID'),
  supplierProductId: z.string().uuid().optional().nullable(),
  orderedQuantity: z.number().int().min(1, 'Ordered quantity must be at least 1').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  unitCost: z.union([z.number().min(0), z.string()]).optional(),
  discount: z.union([z.number().min(0), z.string()]).optional(),
  tax: z.union([z.number().min(0), z.string()]).optional(),
  notes: z.string().optional().nullable(),
}).transform((data) => ({
  ...data,
  orderedQuantity: data.orderedQuantity ?? data.quantity ?? 1,
}));

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier UUID'),
  destinationWarehouseId: z.string().uuid('Invalid warehouse UUID').optional(),
  warehouseId: z.string().uuid('Invalid warehouse UUID').optional(),
  currency: z.string().max(10).optional().default('THB'),
  taxRate: z.union([z.number().min(0), z.string()]).optional(),
  shippingCost: z.union([z.number().min(0), z.string()]).optional(),
  otherCost: z.union([z.number().min(0), z.string()]).optional(),
  notes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  expectedDeliveryDate: z.string().optional().nullable(),
  items: z.array(createPurchaseOrderItemSchema).min(1, 'At least one line item is required'),
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

export const updatePurchaseOrderSchema = z.object({
  destinationWarehouseId: z.string().uuid('Invalid warehouse UUID').optional(),
  warehouseId: z.string().uuid('Invalid warehouse UUID').optional(),
  shippingCost: z.union([z.number().min(0), z.string()]).optional(),
  otherCost: z.union([z.number().min(0), z.string()]).optional(),
  notes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  expectedDeliveryDate: z.string().optional().nullable(),
});

export const approvePurchaseOrderSchema = z.object({
  overrideReason: z.string().optional(),
});

export const rejectPurchaseOrderSchema = z.object({
  reason: z.string().optional(),
  rejectionReason: z.string().optional(),
}).transform((data) => ({
  reason: data.reason || data.rejectionReason || 'Rejected by procurement management',
}));

export const cancelPurchaseOrderSchema = z.object({
  reason: z.string().optional(),
  cancellationReason: z.string().optional(),
}).transform((data) => ({
  reason: data.reason || data.cancellationReason || 'Cancelled by procurement management',
}));
