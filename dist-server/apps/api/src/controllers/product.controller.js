"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const product_schema_1 = require("../schemas/product.schema");
const client_1 = require("@prisma/client");
class ProductController {
    static extractMetadata(request) {
        return {
            userId: request.user?.id,
            ipAddress: request.headers['x-forwarded-for'] || request.ip,
            userAgent: request.headers['user-agent'],
            requestId: request.headers['x-request-id'] || request.id,
        };
    }
    static resolveUserPriceTier(request) {
        const customerType = request.user?.customerProfile?.customerType;
        if (customerType === client_1.CustomerType.GARAGE)
            return client_1.PriceTier.GARAGE;
        if (customerType === client_1.CustomerType.SHOP)
            return client_1.PriceTier.SHOP;
        return client_1.PriceTier.GENERAL;
    }
    static maskProductPrices(product, isAuthenticated) {
        if (isAuthenticated || !product)
            return product;
        const { price, compareAtPrice, costPrice, prices, effectivePrice, variants, ...rest } = product;
        const sanitizedVariants = variants?.map((v) => {
            const { price, ...vRest } = v;
            return { ...vRest, price: null };
        });
        return {
            ...rest,
            price: null,
            compareAtPrice: null,
            prices: [],
            effectivePrice: null,
            ...(variants ? { variants: sanitizedVariants } : {}),
        };
    }
    // Public Storefront: List products with pagination, filters, sort, search
    static async listPublic(request, reply) {
        const query = product_schema_1.productQuerySchema.parse(request.query);
        const userTier = ProductController.resolveUserPriceTier(request);
        const result = await product_service_1.ProductService.listStorefrontProducts(query, userTier);
        const isAuthenticated = !!request.user;
        const items = isAuthenticated
            ? result.items
            : result.items.map((p) => ProductController.maskProductPrices(p, false));
        return reply.status(200).send({ data: items, pagination: result.pagination });
    }
    // Public Storefront: Get by ID
    static async getPublicById(request, reply) {
        const userTier = ProductController.resolveUserPriceTier(request);
        const product = await product_service_1.ProductService.getProductById(request.params.id, userTier, true);
        const isAuthenticated = !!request.user;
        return reply.status(200).send({ data: ProductController.maskProductPrices(product, isAuthenticated) });
    }
    // Public Storefront: Get by Slug
    static async getPublicBySlug(request, reply) {
        const userTier = ProductController.resolveUserPriceTier(request);
        const product = await product_service_1.ProductService.getProductBySlug(request.params.slug, userTier, true);
        const isAuthenticated = !!request.user;
        return reply.status(200).send({ data: ProductController.maskProductPrices(product, isAuthenticated) });
    }
    // Admin: List all products (including unpublished/inactive)
    static async listAdmin(request, reply) {
        const query = product_schema_1.productQuerySchema.parse(request.query);
        const result = await product_service_1.ProductService.listAdminProducts(query);
        return reply.status(200).send({ data: result.items, pagination: result.pagination });
    }
    // Admin: Get by ID (full details)
    static async getAdminById(request, reply) {
        const product = await product_service_1.ProductService.getProductById(request.params.id, client_1.PriceTier.GENERAL, false);
        return reply.status(200).send({ data: product });
    }
    // Admin: Create product
    static async create(request, reply) {
        const input = product_schema_1.createProductSchema.parse(request.body);
        const metadata = ProductController.extractMetadata(request);
        const product = await product_service_1.ProductService.createProduct(input, metadata);
        return reply.status(201).send({ data: product });
    }
    // Admin: Update product
    static async update(request, reply) {
        const input = product_schema_1.updateProductSchema.parse(request.body);
        const metadata = ProductController.extractMetadata(request);
        const product = await product_service_1.ProductService.updateProduct(request.params.id, input, metadata);
        return reply.status(200).send({ data: product });
    }
    // Admin: Soft delete product
    static async delete(request, reply) {
        const metadata = ProductController.extractMetadata(request);
        await product_service_1.ProductService.deleteProduct(request.params.id, metadata);
        return reply.status(200).send({ data: { success: true, message: 'Product deleted successfully' } });
    }
    // Admin: Update pricing tiers
    static async updatePrices(request, reply) {
        const input = product_schema_1.updateProductPricesSchema.parse(request.body);
        const metadata = ProductController.extractMetadata(request);
        const product = await product_service_1.ProductService.updateProductPrices(request.params.id, input, metadata);
        return reply.status(200).send({ data: product });
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map