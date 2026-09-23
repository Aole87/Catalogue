"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const category_schema_1 = require("../schemas/category.schema");
class CategoryController {
    static extractMetadata(request) {
        return {
            userId: request.user?.id,
            ipAddress: request.headers['x-forwarded-for'] || request.ip,
            userAgent: request.headers['user-agent'],
            requestId: request.headers['x-request-id'] || request.id,
        };
    }
    // Public Storefront: Category Tree
    static async getTree(request, reply) {
        const tree = await category_service_1.CategoryService.getCategoryTree(true);
        return reply.status(200).send({ data: tree });
    }
    // Public Storefront: Flat Category List
    static async listPublic(request, reply) {
        const categories = await category_service_1.CategoryService.listCategories(true);
        return reply.status(200).send({ data: categories });
    }
    // Public Storefront: Get by Slug or ID
    static async getBySlug(request, reply) {
        const category = await category_service_1.CategoryService.getCategoryBySlug(request.params.slug);
        return reply.status(200).send({ data: category });
    }
    static async getById(request, reply) {
        const category = await category_service_1.CategoryService.getCategoryById(request.params.id);
        return reply.status(200).send({ data: category });
    }
    // Admin: List all (including inactive)
    static async listAdmin(request, reply) {
        const categories = await category_service_1.CategoryService.listCategories(false);
        return reply.status(200).send({ data: categories });
    }
    // Admin: Create
    static async create(request, reply) {
        const input = category_schema_1.createCategorySchema.parse(request.body);
        const metadata = CategoryController.extractMetadata(request);
        const category = await category_service_1.CategoryService.createCategory(input, metadata);
        return reply.status(201).send({ data: category });
    }
    // Admin: Update
    static async update(request, reply) {
        const input = category_schema_1.updateCategorySchema.parse(request.body);
        const metadata = CategoryController.extractMetadata(request);
        const category = await category_service_1.CategoryService.updateCategory(request.params.id, input, metadata);
        return reply.status(200).send({ data: category });
    }
    // Admin: Delete
    static async delete(request, reply) {
        const metadata = CategoryController.extractMetadata(request);
        await category_service_1.CategoryService.deleteCategory(request.params.id, metadata);
        return reply.status(200).send({ data: { success: true, message: 'Category deleted successfully' } });
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=category.controller.js.map