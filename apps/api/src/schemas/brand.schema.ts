import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100),
  slug: z
    .string()
    .min(1, 'Brand slug is required')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(1000).nullable().optional(),
  logoUrl: z.string().url('Logo URL must be a valid URL').nullable().optional(),
  websiteUrl: z.string().url('Website URL must be a valid URL').nullable().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  description: z.string().max(1000).nullable().optional(),
  logoUrl: z.string().url('Logo URL must be a valid URL').nullable().optional(),
  websiteUrl: z.string().url('Website URL must be a valid URL').nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
