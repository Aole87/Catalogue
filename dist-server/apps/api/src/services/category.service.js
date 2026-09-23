"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("../repositories/category.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class CategoryService {
    static async getCategoryTree(onlyActive = true) {
        const flatCategories = await category_repository_1.CategoryRepository.findAll({ onlyActive });
        const categoryMap = new Map();
        const rootCategories = [];
        // 1. Initialize tree nodes
        for (const cat of flatCategories) {
            categoryMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                imageUrl: cat.imageUrl,
                sortOrder: cat.sortOrder,
                isActive: cat.isActive,
                parentId: cat.parentId,
                children: [],
            });
        }
        // 2. Build tree relations
        for (const cat of flatCategories) {
            const node = categoryMap.get(cat.id);
            if (cat.parentId && categoryMap.has(cat.parentId)) {
                const parentNode = categoryMap.get(cat.parentId);
                parentNode.children.push(node);
            }
            else {
                rootCategories.push(node);
            }
        }
        return rootCategories;
    }
    static async listCategories(onlyActive = false) {
        return category_repository_1.CategoryRepository.findAll({ onlyActive });
    }
    static async getCategoryById(id) {
        const category = await category_repository_1.CategoryRepository.findById(id);
        if (!category || category.deletedAt) {
            throw new app_error_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    static async getCategoryBySlug(slug) {
        const category = await category_repository_1.CategoryRepository.findBySlug(slug);
        if (!category || category.deletedAt) {
            throw new app_error_1.NotFoundException(`Category with slug '${slug}' not found`);
        }
        return category;
    }
    static async createCategory(input, metadata) {
        // 1. Verify slug uniqueness
        const existing = await category_repository_1.CategoryRepository.findBySlug(input.slug);
        if (existing && !existing.deletedAt) {
            throw new app_error_1.ConflictException(`Category slug '${input.slug}' is already in use`);
        }
        // 2. Verify parent if supplied
        if (input.parentId) {
            const parent = await category_repository_1.CategoryRepository.findById(input.parentId);
            if (!parent || parent.deletedAt) {
                throw new app_error_1.BadRequestException(`Parent category with ID ${input.parentId} does not exist`);
            }
        }
        const category = await category_repository_1.CategoryRepository.create(input);
        // 3. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'CATEGORY_CREATED',
            resource: 'category',
            resourceId: category.id,
            after: { name: category.name, slug: category.slug, parentId: category.parentId },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return category;
    }
    static async updateCategory(id, input, metadata) {
        const existing = await this.getCategoryById(id);
        // 1. Verify slug collision if slug changed
        if (input.slug && input.slug !== existing.slug) {
            const duplicateSlug = await category_repository_1.CategoryRepository.findBySlug(input.slug);
            if (duplicateSlug && duplicateSlug.id !== id && !duplicateSlug.deletedAt) {
                throw new app_error_1.ConflictException(`Category slug '${input.slug}' is already in use`);
            }
        }
        // 2. Verify parent and cycle prevention
        if (input.parentId !== undefined && input.parentId !== null) {
            if (input.parentId === id) {
                throw new app_error_1.BadRequestException('A category cannot be its own parent');
            }
            const parent = await category_repository_1.CategoryRepository.findById(input.parentId);
            if (!parent || parent.deletedAt) {
                throw new app_error_1.BadRequestException(`Parent category with ID ${input.parentId} does not exist`);
            }
            // Check if new parent is a descendant of current category
            const descendantIds = await category_repository_1.CategoryRepository.getAllDescendantIds(id);
            if (descendantIds.includes(input.parentId)) {
                throw new app_error_1.BadRequestException('Circular hierarchy detected: parent category cannot be a descendant of this category');
            }
        }
        const updated = await category_repository_1.CategoryRepository.update(id, input);
        // 3. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'CATEGORY_UPDATED',
            resource: 'category',
            resourceId: updated.id,
            before: { name: existing.name, slug: existing.slug, parentId: existing.parentId },
            after: { name: updated.name, slug: updated.slug, parentId: updated.parentId },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return updated;
    }
    static async deleteCategory(id, metadata) {
        const existing = await this.getCategoryById(id);
        // 1. Safety check: Check for existing active products
        const productCount = await category_repository_1.CategoryRepository.countProducts(id);
        if (productCount > 0) {
            throw new app_error_1.ConflictException(`Cannot delete category '${existing.name}' because ${productCount} active product(s) are assigned to it. Reassign products first.`);
        }
        // 2. Safety check: Check for child subcategories
        const childCount = await category_repository_1.CategoryRepository.countChildren(id);
        if (childCount > 0) {
            throw new app_error_1.ConflictException(`Cannot delete category '${existing.name}' because it contains ${childCount} subcategories. Delete or move subcategories first.`);
        }
        const deleted = await category_repository_1.CategoryRepository.softDelete(id);
        // 3. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'CATEGORY_DELETED',
            resource: 'category',
            resourceId: deleted.id,
            before: { name: existing.name, slug: existing.slug },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return deleted;
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map