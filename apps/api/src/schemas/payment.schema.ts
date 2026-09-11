import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order UUID format'),
  provider: z.enum(['PROMPTPAY', 'BANK_TRANSFER', 'TEST', 'COD']).default('PROMPTPAY'),
  method: z.string().optional(),
  idempotencyKey: z.string().max(100).optional(),
});

export const submitSlipSchema = z.object({
  slipUrl: z.string().min(1, 'Slip URL is required'),
  bankName: z.string().max(100).optional(),
  transferAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid transfer amount format').optional(),
  transferredAt: z.string().datetime().or(z.string()).optional(),
  notes: z.string().max(500).optional(),
});

export const verifySlipSchema = z.object({
  verifiedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid verified amount format').optional(),
  note: z.string().max(500).optional(),
});

export const rejectSlipSchema = z.object({
  rejectionReason: z.string().min(3, 'Rejection reason must be at least 3 characters'),
});

export const refundPaymentSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a positive decimal number e.g. 1500.00'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
export type SubmitSlipSchema = z.infer<typeof submitSlipSchema>;
export type VerifySlipSchema = z.infer<typeof verifySlipSchema>;
export type RejectSlipSchema = z.infer<typeof rejectSlipSchema>;
export type RefundPaymentSchema = z.infer<typeof refundPaymentSchema>;
