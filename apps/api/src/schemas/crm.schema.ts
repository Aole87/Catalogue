import { z } from 'zod';
import { CustomerType } from '@prisma/client';

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
  segmentId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
  sortBy: z.enum(['createdAt', 'lifetimeValue', 'orderCount', 'lastOrderDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const updateCustomerMeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
});

export const updateAdminCustomerSchema = z.object({
  customerType: z.nativeEnum(CustomerType).optional(),
  companyName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color e.g. #3B82F6').optional(),
  description: z.string().max(255).optional().nullable(),
});

export const createSegmentSchema = z.object({
  name: z.string().min(1, 'Segment name is required').max(100),
  code: z.string().min(1, 'Segment code is required').max(50),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isAutomatic: z.boolean().optional().default(true),
  rules: z
    .array(
      z.object({
        field: z.string().min(1),
        operator: z.enum([
          'EQUALS',
          'NOT_EQUALS',
          'GREATER_THAN',
          'GREATER_THAN_OR_EQUAL',
          'LESS_THAN',
          'LESS_THAN_OR_EQUAL',
          'CONTAINS',
        ]),
        value: z.string().min(1),
      })
    )
    .optional(),
});

export const updateSegmentSchema = createSegmentSchema.partial();
