import { z } from 'zod';
import { PromotionType, PromotionStatus } from '@prisma/client';

export const promotionQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(PromotionStatus).optional(),
  promotionType: z.nativeEnum(PromotionType).optional(),
  activeOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});

export const createPromotionSchema = z.object({
  name: z.string().min(1, 'Promotion name is required').max(100),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  promotionType: z.nativeEnum(PromotionType).default(PromotionType.PERCENTAGE),
  status: z.nativeEnum(PromotionStatus).default(PromotionStatus.DRAFT),
  startsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  endsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  priority: z.number().int().min(0).default(0),
  stackable: z.boolean().default(false),
  minimumOrderAmount: z.number().min(0).default(0),
  discountValue: z.number().min(0, 'Discount value must be non-negative'),
  maximumDiscountAmount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perCustomerLimit: z.number().int().min(1).optional().nullable(),
  productIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  brandIds: z.array(z.string().uuid()).optional(),
  rules: z
    .array(
      z.object({
        ruleType: z.string().min(1),
        ruleValue: z.any().optional(),
      })
    )
    .optional(),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export const couponQuerySchema = z.object({
  search: z.string().optional(),
  promotionId: z.string().uuid().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});

export const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50),
  promotionId: z.string().uuid('Valid promotion ID is required'),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perCustomerLimit: z.number().int().min(1).optional().nullable(),
  startsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  endsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  perCustomerLimit: z.number().int().min(1).optional().nullable(),
  startsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  endsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  isActive: z.boolean().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().min(0).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        lineTotal: z.number().min(0),
      })
    )
    .optional(),
});
