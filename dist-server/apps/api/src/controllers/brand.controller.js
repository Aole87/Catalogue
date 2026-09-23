"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandController = void 0;
const brand_service_1 = require("../services/brand.service");
const brand_schema_1 = require("../schemas/brand.schema");
class BrandController {
    static extractMetadata(request) {
        return {
            userId: request.user?.id,
            ipAddress: request.headers['x-forwarded-for'] || request.ip,
            userAgent: request.headers['user-agent'],
            requestId: request.headers['x-request-id'] || request.id,
        };
    }
    // Public Storefront: Flat Brand List
    static async listPublic(request, reply) {
        const brands = await brand_service_1.BrandService.listBrands(true);
        return reply.status(200).send({ data: brands });
    }
    // Public Storefront: Get by Slug or ID
    static async getBySlug(request, reply) {
        const brand = await brand_service_1.BrandService.getBrandBySlug(request.params.slug);
        return reply.status(200).send({ data: brand });
    }
    static async getById(request, reply) {
        const brand = await brand_service_1.BrandService.getBrandById(request.params.id);
        return reply.status(200).send({ data: brand });
    }
    // Admin: List all (including inactive)
    static async listAdmin(request, reply) {
        const brands = await brand_service_1.BrandService.listBrands(false);
        return reply.status(200).send({ data: brands });
    }
    // Admin: Create
    static async create(request, reply) {
        const input = brand_schema_1.createBrandSchema.parse(request.body);
        const metadata = BrandController.extractMetadata(request);
        const brand = await brand_service_1.BrandService.createBrand(input, metadata);
        return reply.status(201).send({ data: brand });
    }
    // Admin: Update
    static async update(request, reply) {
        const input = brand_schema_1.updateBrandSchema.parse(request.body);
        const metadata = BrandController.extractMetadata(request);
        const brand = await brand_service_1.BrandService.updateBrand(request.params.id, input, metadata);
        return reply.status(200).send({ data: brand });
    }
    // Admin: Delete
    static async delete(request, reply) {
        const metadata = BrandController.extractMetadata(request);
        await brand_service_1.BrandService.deleteBrand(request.params.id, metadata);
        return reply.status(200).send({ data: { success: true, message: 'Brand deleted successfully' } });
    }
}
exports.BrandController = BrandController;
//# sourceMappingURL=brand.controller.js.map