import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z
    .string()
    .min(1, 'Category slug is required')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  parentId: z.string().uuid('Parent category ID must be a valid UUID').nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().url('Image URL must be a valid URL').nullable().optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  parentId: z.string().uuid('Parent category ID must be a valid UUID').nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().url('Image URL must be a valid URL').nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
