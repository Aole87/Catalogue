import { z } from 'zod';

const sanitizeUrlOrNull = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? null : val),
  z.string().max(2000).nullable().optional()
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
    return s || `brand-${Date.now()}`;
  }
  return val;
}, z.string().min(1, 'Brand slug is required').max(150));

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100),
  slug: sanitizeSlug,
  description: sanitizeTextOrNull,
  logoUrl: sanitizeUrlOrNull,
  websiteUrl: sanitizeUrlOrNull,
  isActive: z.boolean().default(true).optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: sanitizeSlug.optional(),
  description: sanitizeTextOrNull,
  logoUrl: sanitizeUrlOrNull,
  websiteUrl: sanitizeUrlOrNull,
  isActive: z.boolean().optional(),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
