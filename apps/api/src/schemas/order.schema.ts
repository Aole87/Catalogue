import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const shippingAddressSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  phone: z.string().min(8, 'Phone number is required').max(20),
  addressLine: z.string().min(1, 'Address line is required').max(255),
  subdistrict: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  province: z.string().min(1, 'Province is required').max(100),
  postalCode: z.string().min(4, 'Postal code is required').max(10),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  customerNotes: z.string().max(500).optional(),
  paymentMethod: z.enum(['PROMPTPAY', 'BANK_TRANSFER', 'COD', 'CREDIT_CARD']).default('PROMPTPAY').optional(),
  couponCode: z.string().max(50).optional(),
  loyaltyPointsToRedeem: z.number().int().min(0).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason must be at least 3 characters').max(500),
});

export const returnOrderSchema = z.object({
  reason: z.string().min(3, 'Return reason must be at least 3 characters').max(500),
  notes: z.string().max(500).optional(),
});

export const returnActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT'], {
    message: "Action must be 'APPROVE' or 'REJECT'",
  }),
  note: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  toStatus: z.nativeEnum(OrderStatus).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  note: z.string().max(500).optional(),
}).transform((data) => ({
  toStatus: data.toStatus || data.status || OrderStatus.PENDING_PAYMENT,
  note: data.note,
}));

export const customerOrderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  q: z.string().optional(),
  dateFrom: z.string().datetime().or(z.string()).optional(),
  dateTo: z.string().datetime().or(z.string()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20).transform((v) => Math.min(v, 100)),
});

export const adminOrderQuerySchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  shipmentStatus: z.string().optional(),
  dateFrom: z.string().datetime().or(z.string()).optional(),
  dateTo: z.string().datetime().or(z.string()).optional(),
  sortBy: z.enum(['createdAt', 'orderNumber', 'grandTotal', 'totalAmount', 'status']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(20).transform((v) => Math.min(v, 100)),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CancelOrderSchema = z.infer<typeof cancelOrderSchema>;
export type ReturnOrderSchema = z.infer<typeof returnOrderSchema>;
export type ReturnActionSchema = z.infer<typeof returnActionSchema>;
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
export type CustomerOrderQuerySchema = z.infer<typeof customerOrderQuerySchema>;
export type AdminOrderQuerySchema = z.infer<typeof adminOrderQuerySchema>;
