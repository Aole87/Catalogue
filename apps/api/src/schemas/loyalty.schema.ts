import { z } from 'zod';

export const loyaltyAccountQuerySchema = z.object({
  search: z.string().optional(),
  tier: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});

export const adjustLoyaltyPointsSchema = z.object({
  points: z.number().int().refine((val) => val !== 0, 'Points adjustment cannot be 0'),
  reason: z.string().min(1, 'Reason for adjustment is mandatory for financial audit').max(255),
  referenceId: z.string().max(100).optional().nullable(),
});

export const redeemLoyaltySchema = z.object({
  points: z.number().int().min(1, 'Points to redeem must be at least 1'),
  subtotal: z.number().min(0).optional(),
});
