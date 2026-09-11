import { z } from 'zod';
import { ShipmentStatus } from '@prisma/client';

export const createShipmentSchema = z.object({
  orderId: z.string().uuid('Invalid order UUID format'),
  shippingMethodId: z.string().uuid('Invalid shipping method UUID format').optional(),
  carrier: z.string().max(100).optional(),
  serviceLevel: z.string().max(50).optional(),
  recipientName: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  subdistrict: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(10).optional(),
});

export const updateShipmentStatusSchema = z.object({
  toStatus: z.nativeEnum(ShipmentStatus, {
    message: 'Invalid shipment status value',
  }),
  description: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  occurredAt: z.string().datetime().or(z.string()).optional(),
});

export const assignTrackingSchema = z.object({
  trackingNumber: z.string().min(3, 'Tracking number must be at least 3 characters'),
  carrier: z.string().max(100).optional(),
  serviceLevel: z.string().max(50).optional(),
});

export const cancelShipmentSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const adminShipmentQuerySchema = z.object({
  status: z.nativeEnum(ShipmentStatus).optional(),
  carrier: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateShipmentSchema = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatusSchema = z.infer<typeof updateShipmentStatusSchema>;
export type AssignTrackingSchema = z.infer<typeof assignTrackingSchema>;
export type CancelShipmentSchema = z.infer<typeof cancelShipmentSchema>;
export type AdminShipmentQuerySchema = z.infer<typeof adminShipmentQuerySchema>;
