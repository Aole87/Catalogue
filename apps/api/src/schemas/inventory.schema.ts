import { z } from 'zod';
import { InventoryMovementType } from '@prisma/client';

export const createWarehouseSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  addressLine1: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  addressLine1: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createLocationSchema = z.object({
  warehouseId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(255),
  zone: z.string().optional(),
  rack: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  zone: z.string().optional(),
  rack: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const inventoryQuerySchema = z.object({
  q: z.string().optional(),
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  lowStock: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  sortBy: z.enum(['productName', 'sku', 'onHand', 'reserved', 'available', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const reserveStockSchema = z.object({
  orderId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().optional(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
});

export const adjustStockSchema = z.object({
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  direction: z.enum(['INCREASE', 'DECREASE', 'SET']),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  reason: z.string().min(3, 'Adjustment reason must be at least 3 characters'),
  notes: z.string().optional(),
});

export const transferStockSchema = z.object({
  sourceWarehouseId: z.string().uuid(),
  targetWarehouseId: z.string().uuid(),
  sourceLocationId: z.string().uuid().optional(),
  targetLocationId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Transfer quantity must be greater than 0'),
  reason: z.string().min(3, 'Transfer reason must be at least 3 characters'),
  notes: z.string().optional(),
});

export const returnDispositionSchema = z.object({
  orderId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  quantity: z.number().int().positive('Disposition quantity must be greater than 0'),
  disposition: z.enum(['RESTOCK', 'DAMAGED', 'QUARANTINE', 'SCRAP']),
  notes: z.string().optional(),
});

export const movementQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  movementType: z.nativeEnum(InventoryMovementType).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  dateFrom: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  dateTo: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});
