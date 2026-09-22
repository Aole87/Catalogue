import { z } from 'zod';

const sanitizeUrlOrNull = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
  z.string().max(2000).nullable().optional()
);

const sanitizeUuidOrNull = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
  z.string().uuid('Parent category ID must be a valid UUID').nullable().optional()
);

const sanitizeTextOrNull = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
  z.string().max(1000).nullable().optional()
);

const sanitizeSlug = z.preprocess((val) => {
  if (typeof val === 'string') {
    let s = val.trim().toLowerCase().replace(/\s+/g, '-');
    s = s.replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '');
    s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');
    return s || `cat-${Date.now()}`;
  }
  return val;
}, z.string().min(1, 'Category slug is required').max(150));

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: sanitizeSlug,
  parentId: sanitizeUuidOrNull,
  description: sanitizeTextOrNull,
  imageUrl: sanitizeUrlOrNull,
  sortOrder: z.number().int().min(0).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: sanitizeSlug.optional(),
  parentId: sanitizeUuidOrNull,
  description: sanitizeTextOrNull,
  imageUrl: sanitizeUrlOrNull,
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
