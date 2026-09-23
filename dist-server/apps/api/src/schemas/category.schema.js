"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const sanitizeUrlOrNull = zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().max(2000).nullable().optional());
const sanitizeUuidOrNull = zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().uuid('Parent category ID must be a valid UUID').nullable().optional());
const sanitizeTextOrNull = zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().max(1000).nullable().optional());
const sanitizeSlug = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        let s = val.trim().toLowerCase().replace(/\s+/g, '-');
        s = s.replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '');
        s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');
        return s || `cat-${Date.now()}`;
    }
    return val;
}, zod_1.z.string().min(1, 'Category slug is required').max(150));
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').max(100),
    slug: sanitizeSlug,
    parentId: sanitizeUuidOrNull,
    description: sanitizeTextOrNull,
    imageUrl: sanitizeUrlOrNull,
    sortOrder: zod_1.z.number().int().min(0).default(0).optional(),
    isActive: zod_1.z.boolean().default(true).optional(),
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    slug: sanitizeSlug.optional(),
    parentId: sanitizeUuidOrNull,
    description: sanitizeTextOrNull,
    imageUrl: sanitizeUrlOrNull,
    sortOrder: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=category.schema.js.map