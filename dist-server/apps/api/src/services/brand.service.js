"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandService = void 0;
const brand_repository_1 = require("../repositories/brand.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class BrandService {
    static async listBrands(onlyActive = false) {
        return brand_repository_1.BrandRepository.findAll({ onlyActive });
    }
    static async getBrandById(id) {
        const brand = await brand_repository_1.BrandRepository.findById(id);
        if (!brand || brand.deletedAt) {
            throw new app_error_1.NotFoundException(`Brand with ID ${id} not found`);
        }
        return brand;
    }
    static async getBrandBySlug(slug) {
        const brand = await brand_repository_1.BrandRepository.findBySlug(slug);
        if (!brand || brand.deletedAt) {
            throw new app_error_1.NotFoundException(`Brand with slug '${slug}' not found`);
        }
        return brand;
    }
    static async createBrand(input, metadata) {
        // 1. Verify slug uniqueness
        const existingSlug = await brand_repository_1.BrandRepository.findBySlug(input.slug);
        if (existingSlug && !existingSlug.deletedAt) {
            throw new app_error_1.ConflictException(`Brand slug '${input.slug}' is already in use`);
        }
        // 2. Verify name uniqueness
        const existingName = await brand_repository_1.BrandRepository.findByName(input.name);
        if (existingName && !existingName.deletedAt) {
            throw new app_error_1.ConflictException(`Brand with name '${input.name}' already exists`);
        }
        const brand = await brand_repository_1.BrandRepository.create(input);
        // 3. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'BRAND_CREATED',
            resource: 'brand',
            resourceId: brand.id,
            after: { name: brand.name, slug: brand.slug },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return brand;
    }
    static async updateBrand(id, input, metadata) {
        const existing = await this.getBrandById(id);
        // 1. Verify slug collision if slug changed
        if (input.slug && input.slug !== existing.slug) {
            const duplicateSlug = await brand_repository_1.BrandRepository.findBySlug(input.slug);
            if (duplicateSlug && duplicateSlug.id !== id && !duplicateSlug.deletedAt) {
                throw new app_error_1.ConflictException(`Brand slug '${input.slug}' is already in use`);
            }
        }
        // 2. Verify name collision if name changed
        if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
            const duplicateName = await brand_repository_1.BrandRepository.findByName(input.name);
            if (duplicateName && duplicateName.id !== id && !duplicateName.deletedAt) {
                throw new app_error_1.ConflictException(`Brand with name '${input.name}' already exists`);
            }
        }
        const updated = await brand_repository_1.BrandRepository.update(id, input);
        // 3. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'BRAND_UPDATED',
            resource: 'brand',
            resourceId: updated.id,
            before: { name: existing.name, slug: existing.slug },
            after: { name: updated.name, slug: updated.slug },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return updated;
    }
    static async deleteBrand(id, metadata) {
        const existing = await this.getBrandById(id);
        // Safety check: Check for assigned active products
        const productCount = await brand_repository_1.BrandRepository.countProducts(id);
        if (productCount > 0) {
            throw new app_error_1.ConflictException(`Cannot delete brand '${existing.name}' because ${productCount} active product(s) are associated with it. Reassign products first.`);
        }
        const deleted = await brand_repository_1.BrandRepository.softDelete(id);
        // Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'BRAND_DELETED',
            resource: 'brand',
            resourceId: deleted.id,
            before: { name: existing.name, slug: existing.slug },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return deleted;
    }
}
exports.BrandService = BrandService;
//# sourceMappingURL=brand.service.js.map