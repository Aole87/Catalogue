import { z } from 'zod';

export const supplierQuerySchema = z.object({
  q: z.string().optional(),
  search: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
  sortBy: z.enum(['name', 'code', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).transform((data) => ({
  ...data,
  q: data.q || data.search,
}));

export const createSupplierSchema = z.object({
  code: z.string().min(1, 'Supplier code is required').max(50),
  name: z.string().min(1, 'Supplier name is required').max(200),
  displayName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  subdistrict: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(10).optional().default('TH'),
  paymentTerms: z.string().max(50).optional().nullable(),
  currency: z.string().max(10).optional().default('THB'),
  leadTimeDays: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  notes: z.string().optional().nullable(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierProductQuerySchema = z.object({
  supplierId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
  isPreferred: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});

export const createSupplierProductSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier UUID').optional(),
  productId: z.string().uuid('Invalid product UUID'),
  supplierSku: z.string().max(100).optional().nullable(),
  purchaseCost: z.union([z.number().min(0, 'Purchase cost must be non-negative'), z.string()]),
  currency: z.string().max(10).optional().default('THB'),
  moq: z.number().int().min(1, 'MOQ must be at least 1').optional().default(1),
  packSize: z.number().int().min(1, 'Pack size must be at least 1').optional().default(1),
  leadTimeDays: z.number().int().min(0).optional().nullable(),
  isPreferred: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateSupplierProductSchema = z.object({
  supplierSku: z.string().max(100).optional().nullable(),
  purchaseCost: z.union([z.number().min(0, 'Purchase cost must be non-negative'), z.string()]).optional(),
  currency: z.string().max(10).optional(),
  moq: z.number().int().min(1, 'MOQ must be at least 1').optional(),
  packSize: z.number().int().min(1, 'Pack size must be at least 1').optional(),
  leadTimeDays: z.number().int().min(0).optional().nullable(),
  isPreferred: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
