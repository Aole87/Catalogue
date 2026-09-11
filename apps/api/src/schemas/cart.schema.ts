import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999').default(1),
  vehicleVariantId: z.string().uuid('Vehicle Variant ID must be a valid UUID').nullable().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater').max(999, 'Quantity cannot exceed 999'),
});

export const mergeCartSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
