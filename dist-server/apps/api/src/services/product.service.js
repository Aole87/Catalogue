"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const product_repository_1 = require("../repositories/product.repository");
const category_repository_1 = require("../repositories/category.repository");
const brand_repository_1 = require("../repositories/brand.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
const client_1 = require("@prisma/client");
class ProductService {
    static formatProductForResponse(product, userTier = client_1.PriceTier.GENERAL) {
        if (!product)
            return null;
        const formatPriceDecimal = (val) => {
            if (val === null || val === undefined)
                return null;
            return Number(val).toFixed(2);
        };
        // Resolve authoritative active price for user's price tier (fallback to GENERAL)
        const tierPrice = product.prices?.find((p) => p.tier === userTier && p.isActive !== false) ||
            product.prices?.find((p) => p.tier === client_1.PriceTier.GENERAL && p.isActive !== false) ||
            product.prices?.[0] ||
            null;
        const primaryImage = product.images?.find((img) => img.isPrimary) ||
            product.images?.[0] ||
            null;
        const formattedPrices = product.prices?.map((p) => ({
            ...p,
            price: formatPriceDecimal(p.price),
            compareAtPrice: formatPriceDecimal(p.compareAtPrice),
            costPrice: formatPriceDecimal(p.costPrice),
        }));
        return {
            ...product,
            prices: formattedPrices || product.prices,
            effectivePrice: tierPrice
                ? {
                    amount: formatPriceDecimal(tierPrice.price),
                    compareAtPrice: formatPriceDecimal(tierPrice.compareAtPrice),
                    tier: tierPrice.tier,
                    currency: tierPrice.currency,
                }
                : null,
            primaryImage: primaryImage ? primaryImage.url : null,
        };
    }
    static async listStorefrontProducts(query, userTier = client_1.PriceTier.GENERAL) {
        const filters = {
            page: query.page,
            pageSize: query.pageSize,
            vehicleVariantId: query.vehicleVariantId,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            search: query.search || query.q,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            isActive: true,
            isPublished: true,
            includeDeleted: false,
        };
        // Category resolution: support ID or slug, and include subcategories
        if (query.categoryId) {
            const descendantIds = await category_repository_1.CategoryRepository.getAllDescendantIds(query.categoryId);
            filters.categoryIds = [query.categoryId, ...descendantIds];
        }
        else if (query.category) {
            const cat = await category_repository_1.CategoryRepository.findBySlug(query.category);
            if (cat) {
                const descendantIds = await category_repository_1.CategoryRepository.getAllDescendantIds(cat.id);
                filters.categoryIds = [cat.id, ...descendantIds];
            }
        }
        // Brand resolution: support ID or slug
        if (query.brandId) {
            filters.brandId = query.brandId;
        }
        else if (query.brand) {
            const br = await brand_repository_1.BrandRepository.findBySlug(query.brand);
            if (br) {
                filters.brandId = br.id;
            }
        }
        const result = await product_repository_1.ProductRepository.findMany(filters);
        return {
            items: result.items.map((item) => this.formatProductForResponse(item, userTier)),
            pagination: result.pagination,
        };
    }
    static async listAdminProducts(query) {
        const filters = {
            page: query.page,
            pageSize: query.pageSize,
            vehicleVariantId: query.vehicleVariantId,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
            search: query.search || query.q,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            isActive: query.isActive,
            isPublished: query.isPublished,
            includeDeleted: false,
        };
        if (query.categoryId) {
            filters.categoryId = query.categoryId;
        }
        if (query.brandId) {
            filters.brandId = query.brandId;
        }
        const result = await product_repository_1.ProductRepository.findMany(filters);
        return {
            items: result.items.map((item) => this.formatProductForResponse(item)),
            pagination: result.pagination,
        };
    }
    static async getProductById(id, userTier = client_1.PriceTier.GENERAL, isStorefront = false) {
        const product = await product_repository_1.ProductRepository.findById(id);
        if (!product || product.deletedAt || (isStorefront && (!product.isActive || !product.isPublished))) {
            throw new app_error_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return this.formatProductForResponse(product, userTier);
    }
    static async getProductBySlug(slug, userTier = client_1.PriceTier.GENERAL, isStorefront = false) {
        const product = await product_repository_1.ProductRepository.findBySlug(slug);
        if (!product || product.deletedAt || (isStorefront && (!product.isActive || !product.isPublished))) {
            throw new app_error_1.NotFoundException(`Product with slug '${slug}' not found`);
        }
        return this.formatProductForResponse(product, userTier);
    }
    static async createProduct(input, metadata) {
        // 1. Verify SKU uniqueness
        const existingSku = await product_repository_1.ProductRepository.findBySku(input.sku);
        if (existingSku && !existingSku.deletedAt) {
            throw new app_error_1.ConflictException(`Product with SKU '${input.sku}' already exists`);
        }
        // 2. Verify Slug uniqueness
        const existingSlug = await product_repository_1.ProductRepository.findBySlug(input.slug);
        if (existingSlug && !existingSlug.deletedAt) {
            throw new app_error_1.ConflictException(`Product slug '${input.slug}' is already in use`);
        }
        // 3. Verify Category and Brand existence
        const category = await category_repository_1.CategoryRepository.findById(input.categoryId);
        if (!category || category.deletedAt) {
            throw new app_error_1.BadRequestException(`Category with ID ${input.categoryId} does not exist`);
        }
        const brand = await brand_repository_1.BrandRepository.findById(input.brandId);
        if (!brand || brand.deletedAt) {
            throw new app_error_1.BadRequestException(`Brand with ID ${input.brandId} does not exist`);
        }
        // 4. Create Product with transaction
        const product = await product_repository_1.ProductRepository.create(input);
        // 5. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'PRODUCT_CREATED',
            resource: 'product',
            resourceId: product.id,
            after: {
                sku: product.sku,
                name: product.name,
                brandId: product.brandId,
                categoryId: product.categoryId,
            },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return this.formatProductForResponse(product);
    }
    static async updateProduct(id, input, metadata) {
        const existing = await product_repository_1.ProductRepository.findById(id, false);
        if (!existing || existing.deletedAt) {
            throw new app_error_1.NotFoundException(`Product with ID ${id} not found`);
        }
        // 1. Verify SKU collision if changed
        if (input.sku && input.sku !== existing.sku) {
            const duplicateSku = await product_repository_1.ProductRepository.findBySku(input.sku);
            if (duplicateSku && duplicateSku.id !== id && !duplicateSku.deletedAt) {
                throw new app_error_1.ConflictException(`Product SKU '${input.sku}' is already in use`);
            }
        }
        // 2. Verify Slug collision if changed
        if (input.slug && input.slug !== existing.slug) {
            const duplicateSlug = await product_repository_1.ProductRepository.findBySlug(input.slug);
            if (duplicateSlug && duplicateSlug.id !== id && !duplicateSlug.deletedAt) {
                throw new app_error_1.ConflictException(`Product slug '${input.slug}' is already in use`);
            }
        }
        // 3. Verify Category / Brand if updated
        if (input.categoryId && input.categoryId !== existing.categoryId) {
            const category = await category_repository_1.CategoryRepository.findById(input.categoryId);
            if (!category || category.deletedAt) {
                throw new app_error_1.BadRequestException(`Category with ID ${input.categoryId} does not exist`);
            }
        }
        if (input.brandId && input.brandId !== existing.brandId) {
            const brand = await brand_repository_1.BrandRepository.findById(input.brandId);
            if (!brand || brand.deletedAt) {
                throw new app_error_1.BadRequestException(`Brand with ID ${input.brandId} does not exist`);
            }
        }
        const updated = await product_repository_1.ProductRepository.update(id, input);
        // 4. Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'PRODUCT_UPDATED',
            resource: 'product',
            resourceId: id,
            before: { sku: existing.sku, name: existing.name },
            after: { sku: updated.sku, name: updated.name },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return this.formatProductForResponse(updated);
    }
    static async deleteProduct(id, metadata) {
        const existing = await product_repository_1.ProductRepository.findById(id, false);
        if (!existing || existing.deletedAt) {
            throw new app_error_1.NotFoundException(`Product with ID ${id} not found`);
        }
        const deleted = await product_repository_1.ProductRepository.softDelete(id);
        // Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'PRODUCT_DELETED',
            resource: 'product',
            resourceId: id,
            before: { sku: existing.sku, name: existing.name },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return deleted;
    }
    static async updateProductPrices(id, input, metadata) {
        const existing = await product_repository_1.ProductRepository.findById(id, false);
        if (!existing || existing.deletedAt) {
            throw new app_error_1.NotFoundException(`Product with ID ${id} not found`);
        }
        for (const p of input.prices) {
            await product_repository_1.ProductRepository.updatePrice(id, p.tier, p.price, p.compareAtPrice, p.costPrice);
        }
        const updatedProduct = await product_repository_1.ProductRepository.findById(id, true);
        // Record Audit Trail
        await audit_repository_1.AuditRepository.record({
            userId: metadata?.userId,
            action: 'PRICE_UPDATED',
            resource: 'product',
            resourceId: id,
            after: { prices: input.prices },
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
        });
        return this.formatProductForResponse(updatedProduct);
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map